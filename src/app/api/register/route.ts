import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, role, categories } = body as {
      email?: string;
      name?: string;
      password?: string;
      role?: 'UMUM' | 'DESAINER';
      categories?: string[];
    };

    // Validasi input dasar
    if (!email || !name || !password || !role) {
      return NextResponse.json({ message: 'Nama, email, password, dan role wajib diisi.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password minimal 8 karakter.' }, { status: 400 });
    }

    if (!['UMUM', 'DESAINER'].includes(role)) {
      return NextResponse.json({ message: 'Role tidak valid.' }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          // Casting aman karena sudah divalidasi ke 'UMUM' | 'DESAINER'
          role: (role as unknown) as never,
        },
      });

      // Simpan kategori (opsional) bila ada
      if (Array.isArray(categories) && categories.length > 0) {
        // Hapus duplikat
        const unique = Array.from(new Set(categories.filter(Boolean)));
        if (unique.length > 0) {
          const uc = tx as unknown as { userCategory: { create: (args: unknown) => Promise<unknown> } };
          await Promise.all(unique.map(async (cat) => {
            try {
              await uc.userCategory.create({ data: { userId: created.id, categoryName: cat } });
            } catch (e) {
              if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                // duplikat, abaikan
                return;
              }
              throw e;
            }
          }));
        }
      }

      return created;
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role, name: user.name }, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 409 });
      }
      return NextResponse.json({ message: `Gagal mendaftar (Prisma ${error.code}).` }, { status: 500 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: `Terjadi kesalahan pada server: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan pada server (unknown error).' }, { status: 500 });
  }
}