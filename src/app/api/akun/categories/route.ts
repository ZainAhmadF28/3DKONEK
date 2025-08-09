import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const rows = await prisma.userCategory.findMany({
      where: { userId: session.user.id },
      select: { categoryName: true },
      orderBy: { categoryName: 'asc' },
    });
    return NextResponse.json(rows.map((r) => r.categoryName));
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

