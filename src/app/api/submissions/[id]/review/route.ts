import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { ChallengeStatus, SubmissionStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const submissionId = parseInt(params.id, 10);
    const { decision } = await request.json(); // "APPROVED" atau "REVISION_REQUESTED"

    if (!['APPROVED', 'REVISION_REQUESTED'].includes(decision)) {
        return NextResponse.json({ message: 'Keputusan tidak valid.' }, { status: 400 });
    }

    // Ambil data submission untuk verifikasi
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { challenge: true },
    });

    if (!submission) {
      return NextResponse.json({ message: 'Submission tidak ditemukan.' }, { status: 404 });
    }

    // Verifikasi: Hanya pembuat tantangan yang bisa meninjau
    if (submission.challenge.challengerId !== session.user.id) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    // Lakukan update dalam satu transaksi
    const transaction = await prisma.$transaction(async (tx) => {
        // 1. Update status submission
        const updatedSubmission = await tx.submission.update({
            where: { id: submissionId },
            data: { status: decision as SubmissionStatus }
        });

        // 2. Jika disetujui, update status tantangan menjadi DONE
        if (decision === 'APPROVED') {
            await tx.challenge.update({
                where: { id: submission.challengeId },
                data: { status: ChallengeStatus.DONE }
            });
        }
        
        return updatedSubmission;
    });

    return NextResponse.json({ message: 'Submission berhasil ditinjau!', data: transaction });
  } catch (error) {
    console.error('REVIEW_SUBMISSION_ERROR', error);
    return NextResponse.json({ message: 'Gagal meninjau submission.' }, { status: 500 });
  }
}
