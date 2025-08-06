'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import Link from 'next/link'; // Import Link
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ChallengeDetailModal from '@/components/ChallengeDetailModal';

const ChallengesPage = () => {
  const { data: session, status } = useSession(); // Dapatkan status sesi

  // ... (semua state dan useEffect yang sudah ada tetap di sini)
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ...

  return (
    <div className="bg-slate-50">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a2540]" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Papan Tantangan
            </h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.
            </p>
          </div>

          {/* ======================================================= */}
          {/* == TOMBOL BUAT TANTANGAN (HANYA JIKA SUDAH LOGIN) == */}
          {/* ======================================================= */}
          {status === 'authenticated' && (
            <div className="text-center mb-10">
              <Link href="/tantangan/baru" className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                + Buat Tantangan Baru
              </Link>
            </div>
          )}

          {/* ... (Filter dan renderContent() tetap sama) ... */}

        </div>
      </main>
      <Footer />
      
      <ChallengeDetailModal 
        // ... (props tetap sama)
      />
    </div>
  );
};

export default ChallengesPage;