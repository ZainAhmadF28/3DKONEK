import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// POST /api/gallery/purchase  body: { itemId: number }
export async function POST(request: Request) {
  console.log('Purchase API called');
  
  const session = await getServerSession(authOptions);
  console.log('Session:', session?.user?.id ? 'Valid' : 'Invalid');
  
  if (!session?.user?.id) {
    console.log('No valid session found');
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { itemId } = body;
    if (!itemId || typeof itemId !== 'number') {
      console.log('Invalid itemId:', itemId);
      return NextResponse.json({ message: 'ItemId tidak valid.' }, { status: 400 });
    }

    console.log('Looking for item with ID:', itemId);
    const item = await prisma.galleryItem.findUnique({ where: { id: itemId } });
    console.log('Found item:', item ? item.title : 'Not found');
    
    if (!item) {
      return NextResponse.json({ message: 'Item tidak ditemukan.' }, { status: 404 });
    }
    
    if (!item.isPaid) {
      console.log('Item is free, no purchase needed');
      return NextResponse.json({ message: 'Item ini gratis.' }, { status: 400 });
    }

    console.log('Creating purchase record for user:', session.user.id, 'item:', itemId);
    
    // Buat record pembelian (idempotent via unique constraint)
    const purchase = await prisma.galleryPurchase.upsert({
      where: { userId_galleryItemId: { userId: session.user.id, galleryItemId: itemId } },
      update: {},
      create: { userId: session.user.id, galleryItemId: itemId },
    });

    console.log('Purchase created successfully:', purchase.id);
    return NextResponse.json({ success: true, purchaseId: purchase.id });
  } catch (e) {
    console.error('Purchase API error:', e);
    return NextResponse.json({ 
      message: 'Gagal memproses pembayaran.', 
      error: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 });
  }
}

