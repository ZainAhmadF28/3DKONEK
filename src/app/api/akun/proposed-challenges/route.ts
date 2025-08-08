import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Handler untuk GET request.
 * Mengambil semua proposal yang dibuat oleh pengguna yang login,
 * beserta data tantangan lengkap untuk setiap proposal.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const proposals = await prisma.proposal.findMany({
      where: {
        authorId: session.user.id,
      },
      include: {
        // Sertakan data tantangan lengkap untuk setiap proposal
        challenge: {
          include: {
            images: { select: { url: true } },
            challenger: { select: { name: true } },
            _count: { select: { views: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Konversi BigInt 'reward' di dalam data tantangan menjadi string
    const proposalsWithStringReward = proposals.map(proposal => ({
        ...proposal,
        challenge: {
            ...proposal.challenge,
            reward: proposal.challenge.reward.toString(),
        }
    }));

    return NextResponse.json(proposalsWithStringReward);
  } catch (error) {
    console.error('Gagal mengambil tantangan yang diajukan:', error);
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}