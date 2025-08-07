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
    const acceptedChallenges = await prisma.challenge.findMany({
      where: {
        solverId: session.user.id,
        // Ambil semua tantangan yang sedang atau sudah selesai dikerjakan
        status: { in: [ChallengeStatus.IN_PROGRESS, ChallengeStatus.COMPLETED, ChallengeStatus.DONE] }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        images: { select: { url: true } },
        challenger: { select: { name: true } },
        // =======================================================
        // == SERTAKAN RIWAYAT SUBMISSION ==
        // =======================================================
        submissions: {
            orderBy: {
                createdAt: 'desc'
            }
        }
      },
    });

    return NextResponse.json(acceptedChallenges);
  } catch (error) {
    console.error('FETCH_BENGKEL_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data bengkel.' }, { status: 500 });
  }
}
