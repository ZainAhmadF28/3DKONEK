import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types'; // We might need to install this or guess the mime type

// Load environment variables manually if not using Next.js runtime
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

const BUCKET_NAME = 'uploads';

// Helper to guess mime type
function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.glb') return 'model/gltf-binary';
    if (ext === '.gltf') return 'model/gltf+json';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.pdf') return 'application/pdf';
    return 'application/octet-stream';
}

async function uploadFile(localPath: string, folderName: string): Promise<string | null> {
    const filename = path.basename(localPath);
    const supabasePath = `${folderName}/${filename}`;

    try {
        const fileBuffer = fs.readFileSync(localPath);
        const contentType = getMimeType(localPath);

        console.log(`Uploading: ${supabasePath}...`);
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(supabasePath, fileBuffer, {
                contentType,
                upsert: true, // Overwrite if exists
            });

        if (error) {
            console.error(`❌ Gagal upload ${filename}: ${error.message}`);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(supabasePath);

        return publicUrlData.publicUrl;
    } catch (err: any) {
        console.error(`❌ Gagal membaca/upload ${localPath}: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Memulai migrasi aset lokal ke Supabase Storage...\n');

    // 1. MIGRASI GALLERY
    console.log('--- Migrasi GalleryItem ---');
    const galleryItems = await prisma.galleryItem.findMany({
        where: { fileUrl: { startsWith: '/uploads/' } }
    });

    for (const item of galleryItems) {
        if (item.fileUrl && item.fileUrl.startsWith('/uploads/gallery/')) {
            const localPath = path.join(process.cwd(), 'public', item.fileUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'gallery');
                if (publicUrl) {
                    await prisma.galleryItem.update({
                        where: { id: item.id },
                        data: { fileUrl: publicUrl }
                    });
                    console.log(`✅ Update DB GalleryItem ID ${item.id} -> ${publicUrl}`);
                }
            }
        }

        // Poster URL
        if (item.posterUrl && item.posterUrl.startsWith('/uploads/gallery/')) {
            const localPath = path.join(process.cwd(), 'public', item.posterUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'gallery');
                if (publicUrl) {
                    await prisma.galleryItem.update({
                        where: { id: item.id },
                        data: { posterUrl: publicUrl }
                    });
                    console.log(`✅ Update DB GalleryItem Poster ID ${item.id} -> ${publicUrl}`);
                }
            }
        }
    }

    // 2. MIGRASI FORUM POSTS
    console.log('\n--- Migrasi ForumPost ---');
    // @ts-ignore
    const forumPosts = await prisma.forumPost.findMany({
        where: { fileUrl: { startsWith: '/uploads/' } }
    });
    for (const post of forumPosts) {
        if (post.fileUrl && post.fileUrl.startsWith('/uploads/forum/')) {
            const localPath = path.join(process.cwd(), 'public', post.fileUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'forum');
                if (publicUrl) {
                    // @ts-ignore
                    await prisma.forumPost.update({
                        where: { id: post.id },
                        data: { fileUrl: publicUrl }
                    });
                    console.log(`✅ Update DB ForumPost ID ${post.id}`);
                }
            }
        }
    }

    // 3. MIGRASI COMMUNITIES AVATAR
    console.log('\n--- Migrasi Community Avatar ---');
    // @ts-ignore
    const communities = await prisma.community.findMany({
        where: { avatarUrl: { startsWith: '/uploads/' } }
    });
    for (const com of communities) {
        if (com.avatarUrl && com.avatarUrl.startsWith('/uploads/communities/')) {
            const localPath = path.join(process.cwd(), 'public', com.avatarUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'communities');
                if (publicUrl) {
                    // @ts-ignore
                    await prisma.community.update({
                        where: { id: com.id },
                        data: { avatarUrl: publicUrl }
                    });
                    console.log(`✅ Update DB Community ID ${com.id}`);
                }
            }
        }
    }

    // 4. MIGRASI PRIVATE MESSAGES (CHAT)
    console.log('\n--- Migrasi PrivateMessage ---');
    const messages = await prisma.privateMessage.findMany({
        where: { fileUrl: { startsWith: '/uploads/' } }
    });
    for (const msg of messages) {
        if (msg.fileUrl && msg.fileUrl.startsWith('/uploads/chat/')) {
            const localPath = path.join(process.cwd(), 'public', msg.fileUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'chat');
                if (publicUrl) {
                    await prisma.privateMessage.update({
                        where: { id: msg.id },
                        data: { fileUrl: publicUrl }
                    });
                    console.log(`✅ Update DB PrivateMessage ID ${msg.id}`);
                }
            }
        }
    }

    // 5. MIGRASI CHALLENGE IMAGES
    console.log('\n--- Migrasi ChallengeImage ---');
    const challengeImages = await prisma.challengeImage.findMany({
        where: { url: { startsWith: '/uploads/' } }
    });
    for (const img of challengeImages) {
        if (img.url && img.url.startsWith('/uploads/challenges/')) {
            const localPath = path.join(process.cwd(), 'public', img.url);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'challenges');
                if (publicUrl) {
                    await prisma.challengeImage.update({
                        where: { id: img.id },
                        data: { url: publicUrl }
                    });
                    console.log(`✅ Update DB ChallengeImage ID ${img.id}`);
                }
            }
        }
    }

    // 6. MIGRASI PROPOSALS
    console.log('\n--- Migrasi Proposal ---');
    const proposals = await prisma.proposal.findMany({
        where: { fileUrl: { startsWith: '/uploads/' } }
    });
    for (const prop of proposals) {
        if (prop.fileUrl && prop.fileUrl.startsWith('/uploads/proposals/')) {
            const localPath = path.join(process.cwd(), 'public', prop.fileUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'proposals');
                if (publicUrl) {
                    await prisma.proposal.update({
                        where: { id: prop.id },
                        data: { fileUrl: publicUrl }
                    });
                    console.log(`✅ Update DB Proposal ID ${prop.id}`);
                }
            }
        }
    }

    // 7. MIGRASI SUBMISSIONS
    console.log('\n--- Migrasi Submission ---');
    const submissions = await prisma.submission.findMany({
        where: { fileUrl: { startsWith: '/uploads/' } }
    });
    for (const sub of submissions) {
        if (sub.fileUrl && sub.fileUrl.startsWith('/uploads/submissions/')) {
            const localPath = path.join(process.cwd(), 'public', sub.fileUrl);
            if (fs.existsSync(localPath)) {
                const publicUrl = await uploadFile(localPath, 'submissions');
                if (publicUrl) {
                    await prisma.submission.update({
                        where: { id: sub.id },
                        data: { fileUrl: publicUrl }
                    });
                    console.log(`✅ Update DB Submission ID ${sub.id}`);
                }
            }
        }
    }

    console.log('\n🎉 MIGRASI SELESAI!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
