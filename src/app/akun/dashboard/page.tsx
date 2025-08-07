'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard'; // Kita gunakan lagi komponen ini
import Link from 'next/link';

const UserDashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect jika sesi masih loading atau jika tidak terotentikasi
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Ambil data tantangan milik pengguna
  useEffect(() => {
    // Hanya jalankan fetch jika pengguna sudah terotentikasi
    if (status === 'authenticated') {
      const fetchMyChallenges = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/akun/challenges');
          if (res.ok) {
            const data = await res.json();
            setMyChallenges(data);
          }
        } catch (error) {
          console.error('Gagal mengambil tantangan saya:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyChallenges();
    }
  }, [status]); // Jalankan ulang jika status sesi berubah

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Saya</h1>
            <p className="text-slate-600 mt-1">Selamat datang kembali, {session.user?.name}!</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-700">Tantangan yang Saya Buat</h2>
              <Link href="/tantangan/baru" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                + Buat Tantangan Baru
              </Link>
            </div>
            
            {isLoading ? (
              <p>Memuat tantangan Anda...</p>
            ) : myChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChallenges.map((challenge) => (
                  // Kita tidak perlu fungsionalitas klik di sini, jadi kita berikan fungsi kosong
                  <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => {}} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-slate-500">Anda belum membuat tantangan apa pun.</p>
                <Link href="/tantangan/baru" className="text-indigo-600 font-semibold mt-2 inline-block">
                  Buat tantangan pertama Anda!
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

export default UserDashboardPage;
