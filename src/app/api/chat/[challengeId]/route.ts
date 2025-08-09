import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

// Fungsi helper untuk memverifikasi akses pengguna ke chat
async function verifyUserAccess(userId: number, challengeId: number) {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { challengerId: true, solverId: true }
    });
    if (!challenge) return false;
    // User punya akses jika dia adalah pembuat atau pengerja tantangan
    return userId === challenge.challengerId || userId === challenge.solverId;
}

// Handler untuk MENGAMBIL pesan
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

    const messages = await prisma.privateMessage.findMany({
      where: { challengeId: challengeId },
      // PERBAIKAN: Menggunakan relasi 'sender' bukan 'author'
      include: { 
        sender: { 
          select: { id: true, name: true } 
        } 
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("FETCH_PRIVATE_MESSAGES_ERROR", error);
    return NextResponse.json({ message: 'Gagal mengambil pesan.' }, { status: 500 });
  }
}

// Handler untuk MENGIRIM pesan
export async function POST(
  request: Request,
  { params }: { params: { challengeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const challengeId = parseInt(params.challengeId, 10);
    const contentTypeHeader = request.headers.get('content-type') || '';
    let content: string | null = null;
    let fileUrl: string | undefined = undefined;
    let fileType: string | undefined = undefined;

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      content = (formData.get('content') as string) || null;
      const file = formData.get('file') as File | null;
      if (file) {
        const uploadDir = path.join(process.cwd(), 'public/uploads/chat');
        try {
          await stat(uploadDir);
        } catch (e: unknown) {
          if (e.code === 'ENOENT') {
            await mkdir(uploadDir, { recursive: true });
          } else {
            throw e;
          }
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        fileUrl = `/uploads/chat/${filename}`;
        fileType = file.type;
      }
    } else {
      const body = await request.json();
      content = body.content as string;
    }
    const hasAccess = await verifyUserAccess(session.user.id, challengeId);
    if (!hasAccess) {
        return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    if ((!content || content.trim() === '') && !fileUrl) {
      return NextResponse.json({ message: 'Isi pesan atau file wajib diisi.' }, { status: 400 });
    }

    // Tentukan siapa pengirim dan penerima
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { challengerId: true, solverId: true }
    });

    if (!challenge || !challenge.solverId) {
        return NextResponse.json({ message: 'Tantangan tidak valid atau belum memiliki pengerja.' }, { status: 400 });
    }
    
    const senderId = session.user.id;
    const receiverId = senderId === challenge.challengerId ? challenge.solverId : challenge.challengerId;

    const newMessage = await prisma.privateMessage.create({
      // PERBAIKAN: Menggunakan 'senderId' dan 'receiverId'
      data: {
        content: content && content.trim() !== '' ? content : null,
        challengeId: challengeId,
        senderId: senderId,
        receiverId: receiverId,
        fileUrl,
        fileType,
      },
      // PERBAIKAN: Menggunakan relasi 'sender'
      include: { 
        sender: { 
          select: { id: true, name: true } 
        } 
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST_PRIVATE_MESSAGE_ERROR", error);
    return NextResponse.json({ message: 'Gagal mengirim pesan.' }, { status: 500 });
  }
}
