import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

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
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    if (!message) {
      return NextResponse.json({ message: 'Pesan proposal wajib diisi.' }, { status: 400 });
    }

    let fileUrl: string | undefined = undefined;

    if (file) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/proposals');
      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          await mkdir(uploadDir, { recursive: true });
        } else {
          throw e;
        }
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      fileUrl = `/uploads/proposals/${filename}`;
    }

    const newProposal = await prisma.proposal.create({
      data: {
        message,
        fileUrl,
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
