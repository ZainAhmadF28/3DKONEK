import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const challengeId = parseInt(params.id, 10);
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ message: 'Pesan proposal wajib diisi.' }, { status: 400 });
    }

    // Cek apakah user sudah pernah mengajukan proposal untuk tantangan ini
    const existingProposal = await prisma.proposal.findFirst({
        where: {
            challengeId: challengeId,
            authorId: session.user.id
        }
    });

    if (existingProposal) {
        return NextResponse.json({ message: 'Anda sudah mengajukan proposal untuk tantangan ini.' }, { status: 409 });
    }

    const newProposal = await prisma.proposal.create({
      data: {
        message,
        challengeId: challengeId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error('SUBMIT_PROPOSAL_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengajukan proposal.' }, { status: 500 });
  }
}
