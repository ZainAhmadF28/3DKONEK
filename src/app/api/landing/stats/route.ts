import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Data edukasi statis (menggunakan data yang sama dengan halaman edukasi)
const learningModules = [
  {
    id: 1,
    title: 'Membuat Donat 3D di Blender - Tutorial Pemula',
    description: 'Tutorial Blender paling fundamental untuk pemula. Pelajari dasar-dasar navigasi, modeling, dan material dengan membuat donat ikonik dari Blender Guru.',
    videoId: 'fBsQZfAvwts',
    duration: '23:36',
    level: 'Beginner',
    rating: 4.8
  },
  {
    id: 2,
    title: 'Tutorial Membuat Pedang Low Poly',
    description: 'Ciptakan aset game pertamamu! Pelajari teknik modeling low poly yang efisien untuk membuat sebuah pedang yang keren dan siap pakai.',
    videoId: 'QHS45FPdQrA',
    duration: '11:27',
    level: 'Beginner',
    rating: 4.7
  },
  {
    id: 3,
    title: 'Cara Membuat Karakter 3D di Blender (Part 1)',
    description: 'Panduan lengkap membuat karakter manusia dari awal. Pelajari proporsi, modeling wajah, dan tubuh untuk karakter stylize.',
    videoId: '8t5Mymu5Q0A',
    duration: '23:25',
    level: 'Intermediate',
    rating: 4.9
  },
  {
    id: 4,
    title: 'Tutorial Sculpting Karakter Sederhana',
    description: 'Masuki dunia sculpting digital. Pahami brush dasar dan teknik memahat untuk menciptakan bentuk organik sederhana seperti karakter fantasi.',
    videoId: 'mHkw90E5w4o',
    duration: '20:29',
    level: 'Intermediate',
    rating: 4.6
  }
];

// GET /api/landing/stats - Mengambil statistik untuk landing page
export async function GET() {
  try {
    // Ambil statistik dari database
    const [
      assetsCount,
      designersCount,
      challengesCount,
      tutorialsCount,
      recentAssets,
      activeDesigners,
      activeChallenges
    ] = await Promise.all([
      // Count total assets
      prisma.galleryItem.count({
        where: { isApproved: true }
      }),
      
      // Count total designers (users with role DESAINER)
      prisma.user.count({
        where: { role: 'DESAINER' }
      }),
      
      // Count active challenges
      prisma.challenge.count({
        where: { 
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        }
      }),
      
      // Count learning modules
      Promise.resolve(learningModules.length),
      
      // Recent assets dengan model 3D (top 4)
      prisma.galleryItem.findMany({
        where: { 
          isApproved: true,
          fileUrl: {
            contains: '.glb' // Filter hanya file 3D
          }
        },
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          posterUrl: true,
          fileUrl: true,
          description: true
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      }),
      
      // Active designers (top 4 with recent activity)
      prisma.user.findMany({
        where: { role: 'DESAINER' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              galleryItems: true,
              proposals: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      }),
      
      // Active challenges (top 4)
      prisma.challenge.findMany({
        where: { 
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        },
        select: {
          id: true,
          title: true,
          reward: true,
          deadline: true,
          _count: {
            select: {
              proposals: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ]);

    // Format data untuk response
    const stats = {
      assets: assetsCount,
      designers: designersCount,
      challenges: challengesCount,
      tutorials: tutorialsCount
    };

    const previewData = {
      assets: recentAssets.map(asset => ({
        id: asset.id,
        name: asset.title,
        category: asset.category,
        price: asset.price > 0 ? `${(asset.price / 1000).toFixed(0)}K` : 'Gratis',
        posterUrl: asset.posterUrl,
        fileUrl: asset.fileUrl,
        description: asset.description
      })),
      
      designers: activeDesigners.map((designer, index) => ({
        name: designer.name || 'Pengguna',
        project: `${designer._count.galleryItems} Assets, ${designer._count.proposals} Proposal`,
        status: index < 2 ? 'Online' : index === 2 ? 'Busy' : 'Away'
      })),
      
      challenges: activeChallenges.map(challenge => {
        const deadline = new Date(challenge.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          title: challenge.title,
          reward: `${(challenge.reward / 1000000).toFixed(1)} Juta`,
          deadline: `${daysLeft} hari`,
          participants: challenge._count.proposals
        };
      }),
      
      tutorials: learningModules.slice(0, 4).map(tutorial => ({
        title: tutorial.title,
        level: tutorial.level,
        duration: tutorial.duration,
        rating: tutorial.rating,
        videoId: tutorial.videoId
      }))
    };

    return NextResponse.json({
      stats,
      previewData
    });
    
  } catch (error) {
    console.error('Error fetching landing stats:', error);
    return NextResponse.json({ 
      error: 'Gagal mengambil data statistik.' 
    }, { status: 500 });
  }
}
