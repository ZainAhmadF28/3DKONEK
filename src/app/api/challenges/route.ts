import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Fungsi GET yang sudah ada sebelumnya
export async function GET(request: Request) {
  try {
    const jsonDirectory = path.join(process.cwd(), 'src', 'data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'challenges.json'), 'utf8');
    const challenges = JSON.parse(fileContents);
    return NextResponse.json(challenges);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// =======================================================
// == TAMBAHKAN FUNGSI POST BARU INI ==
// =======================================================
export async function POST(request: Request) {
  // 1. Cek otentikasi pengguna
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Tidak diotorisasi', { status: 401 });
  }

  try {
    // 2. Ambil data dari body request
    const body = await request.json();
    const { title, category, imageUrl, description, reward, deadline } = body;

    if (!title || !category || !imageUrl || !description || !reward || !deadline) {
        return new NextResponse('Data tidak lengkap', { status: 400 });
    }

    // 3. Simpan tantangan baru ke database menggunakan Prisma
    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        category,
        imageUrl,
        description,
        reward: parseInt(reward, 10), // Pastikan reward adalah angka
        deadline: new Date(deadline), // Pastikan deadline adalah objek Date
        challengerId: session.user.id, // Hubungkan dengan ID pengguna yang login
      },
    });

    return NextResponse.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error('CREATE_CHALLENGE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}