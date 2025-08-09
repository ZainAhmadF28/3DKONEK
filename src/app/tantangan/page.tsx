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
  const { data: session, status } = useSession();

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
    if (isLoading) return <p className="text-center text-gray-400">Memuat tantangan...</p>;
    if (error) return <p className="text-center text-red-400">Error: {error}</p>;
    if (challenges.length === 0) return <p className="text-center text-gray-400">Belum ada tantangan yang tersedia.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} onClick={() => handleCardClick(challenge)} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className="pt-24 pb-20 flex-grow">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">Papan Tantangan</h1>
            <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
              Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.
            </p>
          </div>

          {status === 'authenticated' && (
            <div className="text-center mb-10">
              <Link
                href="/tantangan/baru"
                className="inline-block bg-lime-400 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-lime-300 transition-colors"
              >
                + Buat Tantangan Baru
              </Link>
            </div>
          )}

          <div className="mb-10 max-w-4xl mx-auto bg-gray-800 border border-white/10 rounded-lg p-4">
            <p className="font-semibold mb-3 text-gray-100">Filter Kategori (opsional)</p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="accent-lime-400"
                  checked={categoryFilters.length === 0}
                  onChange={(e) => { if (e.target.checked) setCategoryFilters([]); }}
                />
                Semua
              </label>
              {(showAllCategories ? CHALLENGE_CATEGORIES : CHALLENGE_CATEGORIES.slice(0, 10)).map((cat) => {
                const checked = categoryFilters.includes(cat);
                return (
                  <label key={cat} className="inline-flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="checkbox"
                      className="accent-lime-400"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCategoryFilters((prev) => Array.from(new Set([...prev, cat])));
                        } else {
                          setCategoryFilters((prev) => prev.filter((c) => c !== cat));
                        }
                      }}
                    />
                    {cat}
                  </label>
                );
              })}
            </div>
            {CHALLENGE_CATEGORIES.length > 10 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowAllCategories((v) => !v)}
                  className="text-lime-400 text-sm font-semibold hover:underline"
                >
                  {showAllCategories ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                </button>
              </div>
            )}
          </div>

          {renderContent()}
        </div>
      </main>
      <Footer />
      <ChallengeDetailModal challenge={selectedChallenge} onClose={handleCloseModal} />
    </div>
  );
};

export default ChallengesPage;