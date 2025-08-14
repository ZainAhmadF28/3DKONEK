import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

/**
 * Handler untuk GET request.
 * Mengambil semua item galeri, bisa difilter berdasarkan kategori.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const itemIdParam = searchParams.get('itemId');

  try {
    // Jika ada itemId, ambil item spesifik
    if (itemIdParam) {
      const itemId = parseInt(itemIdParam);
      if (isNaN(itemId)) {
        return NextResponse.json({ message: 'Invalid item ID.' }, { status: 400 });
      }

      const item = await prisma.galleryItem.findUnique({
        where: { id: itemId },
        include: {
          author: { select: { name: true } },
        },
      });

      if (!item) {
        return NextResponse.json({ message: 'Item tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json(item);
    }

    // Jika admin sedang login, tampilkan semua (pending maupun approved)
    // Jika bukan admin / publik, hanya tampilkan yang sudah approved
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    const whereClause = (() => {
      if (isAdmin) {
        return category && category !== 'Semua' ? { category } : {};
      }
      return category && category !== 'Semua'
        ? { category, isApproved: true }
        : { isApproved: true };
    })();

    const galleryItems = await prisma.galleryItem.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(galleryItems);
  } catch (error) {
    console.error('FETCH_GALLERY_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data galeri.' }, { status: 500 });
  }
}

/**
 * Handler untuk POST request.
 * Meng-handle upload model 3D baru ke galeri.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }
  // Hanya DESAINER/ADMIN yang boleh upload ke perpustakaan
  if (session.user.role !== 'DESAINER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Hanya desainer yang dapat mengunggah model.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;
    const isPaidRaw = formData.get('isPaid') as string | null;
    const priceRaw = formData.get('price') as string | null;
    const file = formData.get('file') as File | null;
    const poster = formData.get('poster') as File | null;

    if (!title || !category || !file) {
      return NextResponse.json({ message: 'Judul, kategori, dan file .glb wajib diisi.' }, { status: 400 });
    }

    // Logika upload file
    const uploadDir = path.join(process.cwd(), 'public/uploads/gallery');
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        throw e;
      }
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    const fileUrl = `/uploads/gallery/${filename}`;

    let posterUrl: string | undefined = undefined;
    if (poster) {
      const posterBuffer = Buffer.from(await poster.arrayBuffer());
      const posterName = `${Date.now()}-${poster.name.replace(/\s/g, '_')}`;
      await writeFile(path.join(uploadDir, posterName), posterBuffer);
      posterUrl = `/uploads/gallery/${posterName}`;
    }

    // Buat entri baru di database
    const newGalleryItem = await prisma.galleryItem.create({
      data: {
        title,
        category,
        description,
        fileUrl,
        authorId: session.user.id,
        posterUrl,
        isPaid: isPaidRaw === 'true',
        price: priceRaw ? parseInt(priceRaw, 10) : 0,
      },
    });

    return NextResponse.json(newGalleryItem, { status: 201 });
  } catch (error) {
    console.error('UPLOAD_GALLERY_ITEM_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengunggah model.' }, { status: 500 });
  }
}
