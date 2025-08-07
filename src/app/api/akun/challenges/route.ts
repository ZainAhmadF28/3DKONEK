import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const userChallenges = await prisma.challenge.findMany({
      where: {
        challengerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: { select: { url: true } },
        proposals: { include: { author: { select: { name: true } } } },
        submissions: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
        // =======================================================
        // == SERTAKAN DETAIL SOLVER (PENGERJA) ==
        // =======================================================
        solver: {
            select: {
                id: true,
                name: true,
            }
        }
      },
    });

    return NextResponse.json(userChallenges);
  } catch (error) {
    console.error('FETCH_USER_CHALLENGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil data tantangan.' }, { status: 500 });
  }
}
