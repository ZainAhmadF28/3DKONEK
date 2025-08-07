import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validasi input dasar
    if (!email || !name || !password) {
      // Mengembalikan error dalam format JSON
      return NextResponse.json({ message: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      // Mengembalikan error dalam format JSON
      return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Mengembalikan data user dalam format JSON saat sukses
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    // Mengembalikan error server dalam format JSON
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}