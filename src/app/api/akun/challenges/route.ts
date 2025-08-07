import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  // 1. Dapatkan sesi pengguna dari server
  const session = await getServerSession(authOptions);

  // 2. Pastikan pengguna sudah login
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    // 3. Ambil tantangan dari database DI MANA challengerId = id pengguna yang login
    const userChallenges = await prisma.challenge.findMany({
      where: {
        challengerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Sertakan juga gambar untuk setiap tantangan
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return NextResponse.json(userChallenges);
  } catch (error) {
    console.error('FETCH_USER_CHALLENGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data tantangan.' }, { status: 500 });
  }
}
