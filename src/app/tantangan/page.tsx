'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import dynamic from 'next/dynamic';
const ChallengeDetailModal = dynamic(() => import('@/components/ChallengeDetailModal'), { ssr: false });
import { CHALLENGE_CATEGORIES } from '@/constants/categories';

const ChallengesPage = () => {
  const { status } = useSession();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const q = categoryFilters.length === 0 ? '' : `?categories=${encodeURIComponent(categoryFilters.join(','))}`;
        const response = await fetch(`/api/challenges${q}`);
        if (!response.ok) throw new Error('Gagal mengambil data tantangan');
        const data = await response.json();
        setChallenges(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [categoryFilters]);

  useEffect(() => {
    const loadUserCategories = async () => {
      if (status !== 'authenticated') return;
      try {
        const res = await fetch('/api/akun/categories');
        if (res.ok) {
          const cats: string[] = await res.json();
          setCategoryFilters(cats);
        }
      } catch {}
    };
    loadUserCategories();
  }, [status]);

  const handleCardClick = (challenge: Challenge) => setSelectedChallenge(challenge);
  const handleCloseModal = () => setSelectedChallenge(null);

  useEffect(() => {
    document.body.style.overflow = selectedChallenge ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedChallenge]);

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-gray-400 col-span-full">Memuat tantangan...</p>;
    if (error) return <p className="text-center text-red-400 col-span-full">Error: {error}</p>;
    if (challenges.length === 0) return <p className="text-center text-gray-400 col-span-full">Belum ada tantangan yang tersedia.</p>;

    return challenges.map((challenge) => (
      <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => handleCardClick(challenge)} />
    ));
  };

  const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #111827; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .glass-card { background: rgba(31, 41, 55, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
  );

  return (
    <>
      <GlobalStyles />
      <div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow pt-28 pb-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit">
                <div className="glass-card rounded-2xl p-6">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">Papan Tantangan</h1>
                  <p className="text-gray-300 mt-4 mb-8">Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.</p>

                  {status === 'authenticated' && (
                    <div className="mb-8">
                      <Link
                        href="/tantangan/baru"
                        className="w-full text-center inline-block bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-300 transition-colors"
                      >
                        + Buat Tantangan Baru
                      </Link>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-4">Filter Kategori</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-gray-200 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          className="accent-lime-400 w-4 h-4 bg-gray-700 border-gray-600"
                          checked={categoryFilters.length === 0}
                          onChange={() => setCategoryFilters([])}
                        />
                        <span>Semua Kategori</span>
                      </label>
                      {CHALLENGE_CATEGORIES.slice(0, 6).map((cat) => (
                        <label key={cat} className="flex items-center gap-3 text-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-lime-400 w-4 h-4 rounded bg-gray-700 border-gray-600"
                            checked={categoryFilters.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCategoryFilters((prev) => Array.from(new Set([...prev, cat])));
                              } else {
                                setCategoryFilters((prev) => prev.filter((c) => c !== cat));
                              }
                            }}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <ChallengeDetailModal challenge={selectedChallenge} onClose={handleCloseModal} />
      </div>
    </>
  );
};

export default ChallengesPage;