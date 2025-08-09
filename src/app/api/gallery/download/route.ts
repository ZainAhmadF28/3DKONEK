import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/gallery/download?itemId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemIdParam = searchParams.get('itemId');
  const itemId = itemIdParam ? parseInt(itemIdParam, 10) : NaN;
  if (!itemIdParam || Number.isNaN(itemId)) return NextResponse.json({ message: 'Param itemId tidak valid.' }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });

  try {
    const item = await prisma.galleryItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ message: 'Item tidak ditemukan.' }, { status: 404 });

    if (item.isPaid) {
      const purchased = await prisma.galleryPurchase.findUnique({
        where: { userId_galleryItemId: { userId: session.user.id, galleryItemId: itemId } },
      });
      if (!purchased) {
        return NextResponse.json({ message: 'Anda belum membeli item ini.' }, { status: 403 });
      }
    }

    // Redirect ke fileUrl agar browser mengunduh
    return NextResponse.redirect(new URL(item.fileUrl, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch (e) {
    return NextResponse.json({ message: 'Gagal memproses unduhan.' }, { status: 500 });
  }
}

