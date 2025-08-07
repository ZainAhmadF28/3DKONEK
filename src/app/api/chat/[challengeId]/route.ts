import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
