import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ChallengeStatus } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    // Ambil tantangan di mana ID solver adalah ID pengguna yang login
    // dan statusnya IN_PROGRESS
    const acceptedChallenges = await prisma.challenge.findMany({
      where: {
        solverId: session.user.id,
        status: ChallengeStatus.IN_PROGRESS,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        images: {
          select: { url: true },
        },
        challenger: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(acceptedChallenges);
  } catch (error) {
    console.error('FETCH_BENGKEL_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data bengkel.' }, { status: 500 });
  }
}
