import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// POST /api/gallery/purchase  body: { itemId: number }
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });

  try {
    const { itemId } = await request.json();
    const item = await prisma.galleryItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ message: 'Item tidak ditemukan.' }, { status: 404 });
    if (!item.isPaid) return NextResponse.json({ message: 'Item ini gratis.' }, { status: 400 });

    // Buat record pembelian (idempotent via unique constraint)
    const purchase = await prisma.galleryPurchase.upsert({
      where: { userId_galleryItemId: { userId: session.user.id, galleryItemId: itemId } },
      update: {},
      create: { userId: session.user.id, galleryItemId: itemId },
    });

    return NextResponse.json({ success: true, purchaseId: purchase.id });
  } catch (e) {
    return NextResponse.json({ message: 'Gagal memproses pembayaran.' }, { status: 500 });
  }
}

