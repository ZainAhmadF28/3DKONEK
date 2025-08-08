import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ChallengeStatus } from '@prisma/client';

/**
 * Handler untuk GET request.
 * Mengambil semua tantangan yang sedang atau telah dikerjakan oleh pengguna yang login.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const acceptedChallenges = await prisma.challenge.findMany({
      where: {
        solverId: session.user.id,
        // Ambil semua tantangan yang relevan untuk pengerja
        status: { in: [ChallengeStatus.IN_PROGRESS, ChallengeStatus.COMPLETED, ChallengeStatus.DONE] }
      },
      orderBy: {
        updatedAt: 'desc',
      },
      // Sertakan semua data yang dibutuhkan oleh kartu tantangan di frontend
      include: {
        images: {
          select: { url: true },
        },
        challenger: {
          select: { name: true },
        },
        _count: {
            select: { views: true }
        }
      },
    });

    // Konversi BigInt 'reward' menjadi string sebelum mengirim respons
    const challengesWithStringReward = acceptedChallenges.map(challenge => ({
        ...challenge,
        reward: challenge.reward.toString(),
    }));

    return NextResponse.json(challengesWithStringReward);
  } catch (error) {
    console.error('Gagal mengambil tantangan yang dikerjakan:', error);
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}