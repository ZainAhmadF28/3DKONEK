import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Handler untuk GET request.
 * Mengambil semua tantangan yang dibuat oleh pengguna yang sedang login.
 */
export async function GET(request: Request) {
  // 1. Dapatkan sesi pengguna dari server untuk keamanan
  const session = await getServerSession(authOptions);

  // 2. Pastikan pengguna sudah login dan memiliki ID
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    // 3. Ambil tantangan dari database di mana 'challengerId' cocok dengan ID pengguna
    const userChallenges = await prisma.challenge.findMany({
      where: {
        challengerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // 4. Sertakan semua data terkait yang dibutuhkan oleh dashboard
      include: {
        images: {
          select: { url: true },
        },
        proposals: {
          include: {
            author: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' }
        },
        submissions: {
          include: {
            author: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        solver: {
            select: {
                id: true,
                name: true,
            }
        },
        _count: {
            select: { views: true }
        }
      },
    });

    // 5. Konversi BigInt 'reward' menjadi string sebelum mengirim respons JSON
    const challengesWithStringReward = userChallenges.map(challenge => ({
        ...challenge,
        reward: challenge.reward.toString(),
    }));

    return NextResponse.json(challengesWithStringReward);
  } catch (error) {
    console.error('FETCH_USER_CHALLENGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data tantangan.' }, { status: 500 });
  }
}