import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  try {
    const items = await prisma.galleryItem.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        category: true,
        isPaid: true,
        price: true,
        isApproved: true,
        posterUrl: true,
        fileUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ message: 'Gagal mengambil perpustakaan saya.' }, { status: 500 });
  }
}


