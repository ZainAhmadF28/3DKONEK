import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
    const { content } = await request.json();
    const hasAccess = await verifyUserAccess(session.user.id, challengeId);
    if (!hasAccess) {
        return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Isi pesan tidak boleh kosong.' }, { status: 400 });
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
        content,
        challengeId: challengeId,
        senderId: senderId,
        receiverId: receiverId,
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
