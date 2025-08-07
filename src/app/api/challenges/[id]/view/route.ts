import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Hanya pengguna yang login yang bisa dicatat view-nya
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Hanya untuk pengguna terdaftar.' }, { status: 401 });
  }

  const challengeId = parseInt(params.id, 10);
  const userId = session.user.id;

  try {
    // Gunakan `upsert` untuk membuat entri baru jika belum ada.
    // Jika sudah ada, tidak melakukan apa-apa. Ini mencegah duplikat.
    await prisma.challengeView.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      update: {}, // Tidak perlu update apa-apa
      create: {
        userId,
        challengeId,
      },
    });
    
    return NextResponse.json({ message: 'View dicatat.' }, { status: 200 });
  } catch (error) {
    // Error bisa terjadi jika challengeId tidak valid, dll.
    return NextResponse.json({ message: 'Gagal mencatat view.' }, { status: 500 });
  }
}
