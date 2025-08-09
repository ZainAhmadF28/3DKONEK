import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { ChallengeStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const challengeId = parseInt(params.id, 10);
    const notes = formData.get('notes') as string | null;
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'File submission (.glb) wajib diunggah.' }, { status: 400 });
    }

    // Verifikasi: Hanya solver yang ditugaskan yang bisa submit
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
    });

    if (!challenge || challenge.solverId !== session.user.id) {
        return NextResponse.json({ message: 'Akses ditolak. Anda bukan pengerja tantangan ini.' }, { status: 403 });
    }
    
    if (challenge.status !== ChallengeStatus.IN_PROGRESS) {
        return NextResponse.json({ message: 'Submission untuk tantangan ini sudah ditutup.' }, { status: 400 });
    }

    // Logika upload file
    const uploadDir = path.join(process.cwd(), 'public/uploads/submissions');
    try {
      await stat(uploadDir);
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        throw e;
      }
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    const fileUrl = `/uploads/submissions/${filename}`;

    // Buat data submission baru
    const newSubmission = await prisma.submission.create({
      data: {
        fileUrl,
        notes,
        challengeId: challengeId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error('SUBMIT_SUBMISSION_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengirimkan hasil pekerjaan.' }, { status: 500 });
  }
}
