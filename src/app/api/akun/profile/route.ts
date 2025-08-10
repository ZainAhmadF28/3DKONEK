import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: 'Gagal mengambil profil.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  try {
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    // Ambil user
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });

    const dataToUpdate: Record<string, unknown> = {};
    if (typeof name === 'string') dataToUpdate.name = name.trim();
    if (typeof email === 'string' && email.trim()) {
      // Pastikan email unik
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 409 });
      }
      dataToUpdate.email = email.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Password saat ini wajib diisi.' }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return NextResponse.json({ message: 'Password saat ini salah.' }, { status: 400 });
      if (newPassword.length < 8) return NextResponse.json({ message: 'Password baru minimal 8 karakter.' }, { status: 400 });
      dataToUpdate.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: dataToUpdate, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ message: 'Gagal menyimpan profil.' }, { status: 500 });
  }
}


