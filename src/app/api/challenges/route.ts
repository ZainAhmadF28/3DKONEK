import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// FUNGSI GET: Mengambil SEMUA tantangan dari database
export async function GET(request: Request) {
  try {
    // Mengambil semua data tantangan dari database menggunakan Prisma
    const challenges = await prisma.challenge.findMany({
      // Urutkan berdasarkan tanggal dibuat, yang terbaru di atas
      orderBy: {
        createdAt: 'desc',
      },
      // Sertakan juga data pembuat tantangan (challenger)
      include: {
        challenger: {
          select: {
            name: true, // Hanya ambil nama pembuatnya
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

// FUNGSI POST: Membuat tantangan BARU ke database
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, imageUrl, description, reward, deadline } = body;

    if (!title || !category || !imageUrl || !description || !reward || !deadline) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        category,
        imageUrl,
        description,
        reward: parseInt(reward, 10),
        deadline: new Date(deadline),
        challengerId: session.user.id,
      },
    });

    return NextResponse.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error('CREATE_CHALLENGE_ERROR', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}