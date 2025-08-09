import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, email, password, role } = body;
    if (!email || !password || !role) return NextResponse.json({ message: 'Email, password, dan role wajib.' }, { status: 400 });
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.default.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hash, role } });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Gagal membuat user.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, name, email, role } = body;
    const user = await prisma.user.update({ where: { id }, data: { name, email, role } });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ message: 'Gagal memperbarui user.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    if (!idParam) return NextResponse.json({ message: 'Parameter id wajib.' }, { status: 400 });
    await prisma.user.delete({ where: { id: parseInt(idParam, 10) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ message: 'Gagal menghapus user.' }, { status: 500 });
  }
}