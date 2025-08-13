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
import { useTheme } from '@/context/ThemeContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CATEGORY_DISPLAY_LIMIT = 6;

const ChallengesPage = () => {
  const { status } = useSession();
  const { theme } = useTheme();

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

  // Tentukan kategori yang akan ditampilkan
  const displayedCategories = showAllCategories 
    ? CHALLENGE_CATEGORIES 
    : CHALLENGE_CATEGORIES.slice(0, CATEGORY_DISPLAY_LIMIT);

  useEffect(() => {
    document.body.style.overflow = selectedChallenge ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedChallenge]);

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-slate-600 dark:text-gray-400 col-span-full">Memuat tantangan...</p>;
    if (error) return <p className="text-center text-red-600 dark:text-red-400 col-span-full">Error: {error}</p>;
    if (challenges.length === 0) return <p className="text-center text-slate-600 dark:text-gray-400 col-span-full">Belum ada tantangan yang tersedia.</p>;

    return challenges.map((challenge) => (
      <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => handleCardClick(challenge)} />
    ));
  };

  const GlobalStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .glass-card { 
          background: rgba(31, 41, 55, 0.4); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .glass-card-light { 
          background: rgba(255, 255, 255, 0.8); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
          border: 1px solid rgba(0, 0, 0, 0.1); 
        }
      `}</style>
  );

  return (
    <>
      <GlobalStyles />
      <div className="bg-white dark:bg-gray-900 min-h-screen text-slate-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
        <Header />
        <main className="flex-grow pt-28 pb-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit">
                <div className={`${theme === 'light' ? 'glass-card-light' : 'glass-card'} rounded-2xl p-6`}>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">Papan Tantangan</h1>
                  <p className="text-slate-600 dark:text-gray-300 mt-4 mb-8">Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.</p>

                  {status === 'authenticated' && (
                    <div className="mb-8">
                      <Link
                        href="/tantangan/baru"
                        className={`w-full text-center inline-block ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg transition-colors`}
                      >
                        + Buat Tantangan Baru
                      </Link>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">Filter Kategori</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-slate-700 dark:text-gray-200 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          className={`w-4 h-4 ${theme === 'light' ? 'accent-blue-600 bg-gray-100 border-gray-300' : 'accent-lime-400 bg-gray-700 border-gray-600'}`}
                          checked={categoryFilters.length === 0}
                          onChange={() => setCategoryFilters([])}
                        />
                        <span>Semua Kategori</span>
                      </label>
                      {displayedCategories.map((cat) => (
                        <label key={cat} className="flex items-center gap-3 text-slate-700 dark:text-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            className={`w-4 h-4 rounded ${theme === 'light' ? 'accent-blue-600 bg-gray-100 border-gray-300' : 'accent-lime-400 bg-gray-700 border-gray-600'}`}
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
                    {CHALLENGE_CATEGORIES.length > CATEGORY_DISPLAY_LIMIT && (
                      <button
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className={`${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-lime-400/80 hover:text-lime-400'} text-sm font-semibold mt-4 flex items-center gap-2 transition-colors`}
                      >
                        {showAllCategories ? (
                          <> <FaChevronUp /> Tampilkan lebih sedikit </>
                        ) : (
                          <> <FaChevronDown /> Tampilkan lebih banyak </>
                        )}
                      </button>
                    )}
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