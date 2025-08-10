'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaTools, FaComments, FaCube } from 'react-icons/fa';
import BengkelDetailModal from '@/components/BengkelDetailModal';
import ThreeDViewerModal from '@/components/ThreeDViewerModal';

// Tipe data Challenge, pastikan sesuai dengan struktur data Anda
interface Challenge {
  id: number;
  title: string;
  description: string;
  reward: number;
  status: string;
  images: { url: string }[];
  // tambahkan properti lain jika ada
}

// Komponen kartu baru yang dirancang khusus untuk halaman ini
const BengkelChallengeCard = ({ challenge, onCardClick, onChatClick }: { challenge: Challenge; onCardClick: () => void; onChatClick: () => void; }) => {
    const thumbnailUrl = challenge.images && challenge.images.length > 0 ? challenge.images[0].url : null;

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-lime-400/10 hover:shadow-2xl">
            {/* Area Gambar yang bisa diklik */}
            <div
                className="relative aspect-video bg-gray-800 cursor-pointer"
                onClick={onCardClick}
            >
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FaCube size={40} />
                    </div>
                )}
                 <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
            </div>
            {/* Konten Kartu */}
            <div className="p-4 flex-grow flex flex-col">
                <h3
                    onClick={onCardClick}
                    className="font-display text-xl font-bold text-white mb-2 truncate cursor-pointer hover:text-lime-400 transition-colors"
                >
                    {challenge.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">Status: <span className="font-semibold text-gray-200">{challenge.status}</span></p>
                <div className="mt-auto">
                    <button
                        onClick={onChatClick}
                        className="w-full text-center block bg-lime-400/80 text-lime-50 font-bold py-2 px-4 rounded-lg hover:bg-lime-400/100 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <FaComments /> Buka Ruang Diskusi
                    </button>
                </div>
            </div>
        </div>
    );
};


const BengkelPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null);

  const fetchAcceptedChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bengkel');
      if (res.ok) {
        setAcceptedChallenges(await res.json());
      }
    } catch (error) {
      console.error('Gagal mengambil data bengkel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchAcceptedChallenges();
    }
  }, [status, router]);

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  const handleView3D = (fileUrl: string) => {
    setModelViewerSrc(fileUrl);
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Memuat...</div>;
  }

  return (
    <>
      <div className="bg-gray-900 min-h-screen text-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-28 pb-20">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <FaTools className="text-5xl text-lime-400 mx-auto mb-4" />
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Bengkel Saya</h1>
              <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">
                Daftar tantangan yang sedang Anda kerjakan. Kelola progres dan diskusikan solusinya di sini.
              </p>
            </div>

            {isLoading ? (
              <p className="text-center text-gray-400">Memuat tantangan Anda...</p>
            ) : acceptedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {acceptedChallenges.map((challenge) => (
                  <BengkelChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onCardClick={() => handleCardClick(challenge)}
                    onChatClick={() => router.push(`/chat/${challenge.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 glass-card rounded-2xl max-w-2xl mx-auto">
                <h3 className="font-display text-2xl font-bold text-white">Bengkel Masih Kosong</h3>
                <p className="text-gray-400 mt-2 mb-6">Anda belum mengerjakan tantangan apa pun. Saatnya mencari proyek baru!</p>
                <Link href="/tantangan" className="inline-block bg-lime-400 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-300 transition-transform duration-300 hover:scale-105">
                  Cari Tantangan
                </Link>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      <BengkelDetailModal
        challenge={selectedChallenge}
        onClose={handleCloseModal}
        onSubmissionSuccess={fetchAcceptedChallenges}
        onView3D={handleView3D}
      />

      {modelViewerSrc && (
        <ThreeDViewerModal
          src={modelViewerSrc}
          onClose={() => setModelViewerSrc(null)}
        />
      )}
      
      <style jsx global>{`
        .glass-card {
            background: rgba(31, 41, 55, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }
        body {
            font-family: 'Inter', sans-serif;
        }
      `}</style>
    </>
  );
};

export default BengkelPage;
