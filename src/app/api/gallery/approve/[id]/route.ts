import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Hanya admin yang dapat menyetujui.' }, { status: 403 });
  }
  const id = parseInt(params.id, 10);
  try {
    const updated = await prisma.galleryItem.update({
      where: { id },
      data: { isApproved: true, approvedById: session.user.id },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ message: 'Gagal menyetujui item.' }, { status: 500 });
  }
}

