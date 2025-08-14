import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/gallery/purchased?itemId=123
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ purchased: false, message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemIdParam = searchParams.get('itemId');

  if (!itemIdParam) {
    return NextResponse.json({ purchased: false, message: 'ItemId diperlukan.' }, { status: 400 });
  }

  const itemId = parseInt(itemIdParam);
  if (isNaN(itemId)) {
    return NextResponse.json({ purchased: false, message: 'ItemId tidak valid.' }, { status: 400 });
  }

  try {
    // Cek apakah item ada
    const item = await prisma.galleryItem.findUnique({
      where: { id: itemId },
      select: { id: true, isPaid: true }
    });

    if (!item) {
      return NextResponse.json({ purchased: false, message: 'Item tidak ditemukan.' }, { status: 404 });
    }

    // Jika item gratis, return purchased = true
    if (!item.isPaid) {
      return NextResponse.json({ purchased: true, reason: 'free_item' });
    }

    // Cek apakah user sudah membeli item ini
    const purchase = await prisma.galleryPurchase.findUnique({
      where: {
        userId_galleryItemId: {
          userId: session.user.id,
          galleryItemId: itemId
        }
      }
    });

    return NextResponse.json({ 
      purchased: !!purchase,
      purchaseId: purchase?.id || null,
      purchaseDate: purchase?.createdAt || null
    });

  } catch (error) {
    console.error('Check purchase error:', error);
    return NextResponse.json({ 
      purchased: false, 
      message: 'Gagal mengecek status pembelian.' 
    }, { status: 500 });
  }
}
