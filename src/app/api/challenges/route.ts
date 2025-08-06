import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

// Fungsi GET tetap sama
export async function GET(request: Request) {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        challenger: { select: { name: true } },
        images: {
          select: {
            url: true,
          },
        },
      },
    });
    return NextResponse.json(challenges);
  } catch (error) {
    console.error('FETCH_CHALLENGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data dari database.' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi. Silakan login terlebih dahulu.' }, { status: 401 });
  }

  // =======================================================
  // == INI ADALAH PERBAIKAN KUNCI DAN PALING PENTING ==
  // =======================================================
  // Verifikasi bahwa pengguna yang ada di sesi benar-benar ada di database.
  // Ini mencegah error jika database di-reset saat pengguna masih login.
  const userExists = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!userExists) {
    return NextResponse.json({ message: 'Sesi Anda tidak valid. Silakan logout dan login kembali.' }, { status: 404 });
  }
  // =======================================================

  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const reward = formData.get('reward') as string;
    const deadline = formData.get('deadline') as string;
    const imageFiles = formData.getAll('imageFiles') as File[];

    if (!title || !category || !description || !reward || !deadline || imageFiles.length === 0) {
      return NextResponse.json({ message: 'Semua kolom, termasuk minimal satu gambar, wajib diisi.' }, { status: 400 });
    }
    
    const uploadDir = path.join(process.cwd(), 'public/uploads/challenges');
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        throw e;
      }
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
        reward: parseInt(reward, 10),
        deadline: new Date(deadline),
        challengerId: session.user.id, // Sekarang dijamin aman
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
