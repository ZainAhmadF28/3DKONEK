import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { ChallengeStatus, ProposalStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const proposalId = parseInt(params.id, 10);

    // Ambil proposal beserta tantangannya untuk verifikasi
    const proposalToApprove = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { challenge: true },
    });

    if (!proposalToApprove) {
      return NextResponse.json({ message: 'Proposal tidak ditemukan.' }, { status: 404 });
    }

    // Verifikasi: Hanya pembuat tantangan yang bisa menyetujui
    if (proposalToApprove.challenge.challengerId !== session.user.id) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }
    
    // Verifikasi: Hanya tantangan yang OPEN yang bisa disetujui
    if (proposalToApprove.challenge.status !== ChallengeStatus.OPEN) {
        return NextResponse.json({ message: 'Tantangan ini sudah tidak lagi menerima proposal.' }, { status: 400 });
    }

    const { challengeId, authorId } = proposalToApprove;

    // Gunakan transaksi untuk memastikan semua update berhasil atau tidak sama sekali
    const transaction = await prisma.$transaction([
      // 1. Update proposal yang disetujui menjadi APPROVED
      prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.APPROVED },
      }),
      // 2. Update semua proposal lain di tantangan yang sama menjadi REJECTED
      prisma.proposal.updateMany({
        where: {
          challengeId: challengeId,
          id: { not: proposalId },
        },
        data: { status: ProposalStatus.REJECTED },
      }),
      // 3. Update tantangan: status menjadi IN_PROGRESS dan set solverId
      prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: ChallengeStatus.IN_PROGRESS,
          solverId: authorId,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Proposal berhasil disetujui!', data: transaction });
  } catch (error) {
    console.error('APPROVE_PROPOSAL_ERROR', error);
    return NextResponse.json({ message: 'Gagal menyetujui proposal.' }, { status: 500 });
  }
}
