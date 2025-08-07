'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import Link from 'next/link';
import { FaTools } from 'react-icons/fa';

const BengkelPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
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
      fetchAcceptedChallenges();
    }
  }, [status]);

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
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
                  <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => {}} />
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
  );
};

export default BengkelPage;
