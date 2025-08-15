import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/akun/purchases - Mengambil riwayat pembelian pengguna
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const purchases = await prisma.galleryPurchase.findMany({
      where: { userId: session.user.id },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            posterUrl: true,
            fileUrl: true,
            description: true,
            category: true,
            isApproved: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pembelian.' }, { status: 500 });
  }
}
