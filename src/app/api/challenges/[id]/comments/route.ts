import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

/**
 * Handler untuk GET request.
 * Mengambil semua komentar publik untuk sebuah tantangan.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = parseInt(params.id, 10);

    const comments = await prisma.publicComment.findMany({
      where: { challengeId: challengeId },
      include: {
        // PERBAIKAN: Gunakan 'user' bukan 'author'
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('FETCH_COMMENTS_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil komentar.' }, { status: 500 });
  }
}

/**
 * Handler untuk POST request.
 * Mengirim komentar publik baru ke sebuah tantangan.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Hanya pengguna terdaftar yang bisa berkomentar.' }, { status: 401 });
  }

  try {
    const challengeId = parseInt(params.id, 10);
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Isi komentar tidak boleh kosong.' }, { status: 400 });
    }

    const newComment = await prisma.publicComment.create({
      data: {
        content,
        challengeId: challengeId,
        // PERBAIKAN: Gunakan 'userId' bukan 'authorId'
        userId: session.user.id,
      },
      include: {
        // PERBAIKAN: Gunakan 'user' bukan 'author'
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('POST_COMMENT_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengirim komentar.' }, { status: 500 });
  }
}
