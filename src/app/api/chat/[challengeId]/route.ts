import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import path from 'path';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';

async function verifyUserAccess(userId: number, challengeId: number) {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { challengerId: true, solverId: true }
    });
    if (!challenge) return false;
    return userId === challenge.challengerId || userId === challenge.solverId;
}

export async function GET(
  request: Request,
  { params }: { params: { challengeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const challengeId = parseInt(params.challengeId, 10);
    const hasAccess = await verifyUserAccess(session.user.id, challengeId);
    if (!hasAccess) {
        return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const messages = await prisma.privateMessage.findMany({ // MENGGUNAKAN privateMessage
      where: { challengeId: challengeId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil pesan.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { challengeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: number; email: string } | undefined;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Tidak diotorisasi.' }, { status: 401 });
    }

    const challengeId = parseInt(params.challengeId, 10);
    const hasAccess = await verifyUserAccess(user.id, challengeId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const formData = await request.formData();
    const content = formData.get('content') as string || '';
    const file = formData.get('file') as File | null;

    let fileUrl: string | undefined;
    let fileType: string | undefined;

    if (file) {
      try {
        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = path.join(uploadDir, filename);
        
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/chat/${filename}`;
        fileType = file.type;
      } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Gagal mengupload file.' }, { status: 500 });
      }
    }

    if (!content && !fileUrl) {
      return NextResponse.json({ error: 'Pesan atau file harus diisi.' }, { status: 400 });
    }

    const message = await prisma.privateMessage.create({
      data: {
        content,
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
        challengeId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Gagal mengirim pesan.' }, { status: 500 });
  }

  try {
    const challengeId = parseInt(params.challengeId, 10);
    const { content } = await request.json();
    const hasAccess = await verifyUserAccess(session.user.id, challengeId);
    if (!hasAccess) {
        return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Isi pesan tidak boleh kosong.' }, { status: 400 });
    }

    const newMessage = await prisma.privateMessage.create({ // MENGGUNAKAN privateMessage
      data: {
        content,
        challengeId: challengeId,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengirim pesan.' }, { status: 500 });
  }
}
