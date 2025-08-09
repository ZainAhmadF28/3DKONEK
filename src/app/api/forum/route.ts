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
    const { searchParams } = new URL(request.url);
    const communityIdParam = searchParams.get('communityId');
    const communityId = communityIdParam ? parseInt(communityIdParam, 10) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma;
    const posts = await db.forumPost.findMany({
      where: communityId ? { communityId } : undefined,
      include: {
        author: {
          select: { name: true },
        },
        community: { select: { id: true, name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
  } catch (error: unknown) {
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
    const communityIdParam = formData.get('communityId') as string | null;
    const communityId = communityIdParam ? parseInt(communityIdParam, 10) : undefined;

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

    // Use a narrowed type to avoid any while the Prisma client types refresh
    const newPost = await (prisma as unknown as {
      forumPost: {
        create: (args: unknown) => Promise<unknown>
      }
    }).forumPost.create({
      data: {
        content,
        fileUrl,
        fileType,
        authorId: session.user.id,
        communityId,
      },
      include: {
        author: { select: { name: true } },
        community: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    console.error('FORUM_POST_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengirim postingan.' }, { status: 500 });
  }
}
