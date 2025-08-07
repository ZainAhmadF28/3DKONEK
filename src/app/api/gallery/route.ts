import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

/**
 * Handler untuk GET request.
 * Mengambil semua item galeri, bisa difilter berdasarkan kategori.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const whereClause = category && category !== 'Semua' ? { category: category } : {};

    const galleryItems = await prisma.galleryItem.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true },
        },
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

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;
    const file = formData.get('file') as File | null;

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

    // Buat entri baru di database
    const newGalleryItem = await prisma.galleryItem.create({
      data: {
        title,
        category,
        description,
        fileUrl,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newGalleryItem, { status: 201 });
  } catch (error) {
    console.error('UPLOAD_GALLERY_ITEM_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengunggah model.' }, { status: 500 });
  }
}
