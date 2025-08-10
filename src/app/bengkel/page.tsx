'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import Link from 'next/link';
import { FaTools, FaComments } from 'react-icons/fa';
import BengkelDetailModal from '@/components/BengkelDetailModal';
import ThreeDViewerModal from '@/components/ThreeDViewerModal'; // Import modal 3D

const BengkelPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  //ada sesuatu
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null); // State baru

  const fetchAcceptedChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bengkel');
      if (res.ok) {
        const data = await res.json();
        setAcceptedChallenges(data);
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

  // Fungsi baru untuk membuka penampil 3D
  const handleView3D = (fileUrl: string) => {
    setModelViewerSrc(fileUrl);
  };

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow pt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="mb-8 flex items-center gap-4">
              <FaTools className="text-4xl text-slate-700" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Bengkel Saya</h1>
                <p className="text-slate-600 mt-1">Daftar tantangan yang sedang Anda kerjakan.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              {isLoading ? (
                <p>Memuat tantangan Anda...</p>
              ) : acceptedChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedChallenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white rounded-lg shadow-lg flex flex-col">
                        <ChallengeCard 
                            challenge={challenge} 
                            onClick={() => handleCardClick(challenge)} 
                        />
                        <div className="p-4 border-t">
                            <Link href={`/chat/${challenge.id}`} className="w-full text-center block bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2">
                                <FaComments /> Buka Chat Diskusi
                            </Link>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-slate-500">Anda belum mengerjakan tantangan apa pun.</p>
                  <Link href="/tantangan" className="text-indigo-600 font-semibold mt-2 inline-block">
                    Cari tantangan untuk dikerjakan!
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <BengkelDetailModal 
        challenge={selectedChallenge}
        onClose={handleCloseModal}
        onSubmissionSuccess={fetchAcceptedChallenges}
        onView3D={handleView3D} // Teruskan fungsi handler ke modal
      />

      {/* Render modal 3D secara kondisional */}
      {modelViewerSrc && (
        <ThreeDViewerModal 
          src={modelViewerSrc} 
          onClose={() => setModelViewerSrc(null)} 
        />
      )}
    </>
  );
};

export default BengkelPage;
