import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';

// GET: list all communities
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma;
    const communities = await db.community.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, avatarUrl: true, ownerId: true },
    });
    return NextResponse.json(communities);
  } catch (error) {
    console.error('FETCH_COMMUNITIES_ERROR', error);
    return NextResponse.json({ message: 'Gagal mengambil komunitas.' }, { status: 500 });
  }
}

// POST: create a community (multipart: name, description, avatar)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak diotorisasi.' }, { status: 401 });
  }
  try {
    const contentType = request.headers.get('content-type') || '';
    let name: string | undefined;
    let description: string | null = null;
    let avatarUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = (formData.get('name') as string | null)?.trim() || undefined;
      description = ((formData.get('description') as string | null)?.trim() || '') || null;
      const avatar = formData.get('avatar') as File | null;
      if (avatar) {
        const uploadDir = path.join(process.cwd(), 'public/uploads/communities');
        try { await stat(uploadDir); } catch (e: unknown) {
          if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 'ENOENT') {
            await mkdir(uploadDir, { recursive: true });
          } else { throw e; }
        }
        const buffer = Buffer.from(await avatar.arrayBuffer());
        const filename = `${Date.now()}-${avatar.name.replace(/\s/g, '_')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        avatarUrl = `/uploads/communities/${filename}`;
      }
    } else {
      const body = await request.json();
      name = (body?.name as string | undefined)?.trim();
      description = ((body?.description as string | undefined)?.trim() || '') || null;
      avatarUrl = body?.avatarUrl as string | undefined;
    }

    if (!name) {
      return NextResponse.json({ message: 'Nama komunitas wajib diisi.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma;
    const created = await db.community.create({
      data: {
        name,
        description,
        avatarUrl,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'OWNER' },
        },
      },
      select: { id: true, name: true, description: true, avatarUrl: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('CREATE_COMMUNITY_ERROR', error);
    return NextResponse.json({ message: 'Gagal membuat komunitas.' }, { status: 500 });
  }
}


