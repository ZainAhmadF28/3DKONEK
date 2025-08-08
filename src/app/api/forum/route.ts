import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

/**
 * Handler untuk GET request.
 * Mengambil semua postingan forum.
 */
export async function GET(request: Request) {
  try {
    const posts = await prisma.forumPost.findMany({
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('FETCH_FORUM_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil postingan forum.' }, { status: 500 });
  }
}

/**
 * Handler untuk POST request.
 * Mengirim postingan forum baru, termasuk menangani upload file.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi. Silakan login untuk mengirim postingan.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Isi pesan tidak boleh kosong.' }, { status: 400 });
    }

    let fileUrl: string | undefined = undefined;
    let fileType: string | undefined = undefined;

    if (file) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/forum');
      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          await mkdir(uploadDir, { recursive: true });
        } else {
          throw e;
        }
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      fileUrl = `/uploads/forum/${filename}`;
      fileType = file.type;
    }

    const newPost = await prisma.forumPost.create({
      data: {
        content,
        fileUrl,
        fileType,
        authorId: session.user.id,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('FORUM_POST_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengirim postingan.' }, { status: 500 });
  }
}
