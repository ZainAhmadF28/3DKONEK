import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam
      ? categoriesParam.split(',').map((c) => c.trim()).filter(Boolean)
      : undefined;

    const whereClause = categories && categories.length > 0
      ? { category: { in: categories } }
      : category
        ? { category }
        : undefined;

    const challengesFromDb = await prisma.challenge.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        challenger: { select: { name: true } },
        images: { select: { url: true } },
        _count: {
          select: { views: true },
        },
      },
    });

    return NextResponse.json(challengesFromDb);
  } catch (error) {
    console.error('FETCH_CHALLENGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data dari database.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  // Hanya UMUM (dan ADMIN) yang boleh membuat tantangan
  if (session.user.role !== 'UMUM' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Hanya pengguna dengan role UMUM yang dapat membuat tantangan.' }, { status: 403 });
  }
  
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userExists) {
    return NextResponse.json({ message: 'Sesi Anda tidak valid.' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const material = formData.get('material') as string;
    const reward = formData.get('reward') as string;
    const deadline = formData.get('deadline') as string;
    const imageFiles = formData.getAll('imageFiles') as File[];

    if (!title || !category || !description || !reward || !deadline || imageFiles.length === 0) {
      return NextResponse.json({ message: 'Semua kolom wajib diisi.' }, { status: 400 });
    }
    
    // ... (logika upload file tetap sama)
    const uploadDir = path.join(process.cwd(), 'public/uploads/challenges');
    try {
      await stat(uploadDir);
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else { throw e; }
    }
    const imageUrlPaths: string[] = [];
    for (const imageFile of imageFiles) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = Date.now() + '-' + imageFile.name.replace(/\s/g, '_');
        const uploadPath = path.join(uploadDir, filename);
        await writeFile(uploadPath, buffer);
        imageUrlPaths.push(`/uploads/challenges/${filename}`);
    }

    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        category,
        description,
        material,
        // Simpan sebagai Int sesuai schema
        reward: parseInt(reward, 10),
        deadline: new Date(deadline),
        challengerId: session.user.id,
        images: {
          create: imageUrlPaths.map(url => ({ url })),
        },
      },
    });

    return NextResponse.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error('CREATE_CHALLENGE_ERROR', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat mengunggah.' }, { status: 500 });
  }
}
