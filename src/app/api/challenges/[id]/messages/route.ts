import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GrDashboard } from 'react-icons/gr';

// FUNGSI UNTUK MENGAMBIL SEMUA PESAN
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = parseInt(params.id, 10);
    const messages = await prisma.message.findMany({
      where: { challengeId: challengeId },
      include: {
        author: {
          select: {
            name: true, // HANYA AMBIL NAMA, KARENA 'image' TIDAK ADA
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('FETCH_MESSAGES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil pesan.' }, { status: 500 });
  }
}

// FUNGSI UNTUK MENGIRIM PESAN BARU
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Hanya pengguna terdaftar yang bisa mengirim pesan.' }, { status: 401 });
  }

  try {
    const challengeId = parseInt(params.id, 10);
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Isi pesan tidak boleh kosong.' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        challengeId: challengeId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true, // HANYA AMBIL NAMA, KARENA 'image' TIDAK ADA
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('POST_MESSAGE_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengirim pesan.' }, { status: 500 });
  }
}
