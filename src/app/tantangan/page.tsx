'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ChallengeDetailModal from '@/components/ChallengeDetailModal';
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
        if (!response.ok) {
          throw new Error('Gagal mengambil data tantangan');
        }
        const data = await response.json();
        setChallenges(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Terjadi kesalahan yang tidak diketahui.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [categoryFilters]);

  // Ambil kategori default pengguna setelah login
  useEffect(() => {
    const loadUserCategories = async () => {
      if (status !== 'authenticated') return;
      try {
        const res = await fetch('/api/akun/categories');
        if (res.ok) {
          const cats: string[] = await res.json();
          setCategoryFilters(cats);
        }
      } catch {
        // ignore
      }
    };
    loadUserCategories();
  }, [status]);

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };
  
  // Efek untuk mencegah scroll di background saat modal terbuka
  useEffect(() => {
    if (selectedChallenge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedChallenge]);

  // Fungsi untuk menampilkan konten berdasarkan state (loading, error, atau sukses)
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">Memuat tantangan...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">Error: {error}</p>;
    }
    
    if (challenges.length === 0) {
        return <p className="text-center text-gray-500">Belum ada tantangan yang tersedia.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => (
          <ChallengeCard 
            key={challenge.id} 
            challenge={challenge} 
            onClick={() => handleCardClick(challenge)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      <main className="pt-24 pb-20 flex-grow">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a2540]" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Papan Tantangan
            </h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.
            </p>
          </div>

          {/* Tombol ini hanya muncul jika pengguna sudah login */}
          {status === 'authenticated' && (
            <div className="text-center mb-10">
              <Link href="/tantangan/baru" className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
                + Buat Tantangan Baru
              </Link>
            </div>
          )}

          <div className="mb-10 max-w-4xl mx-auto bg-white p-4 rounded-lg shadow">
            <p className="font-semibold mb-2">Filter Kategori (opsional)</p>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={categoryFilters.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) setCategoryFilters([]);
                  }}
                />
                Semua
              </label>
              {(showAllCategories ? CHALLENGE_CATEGORIES : CHALLENGE_CATEGORIES.slice(0, 10)).map((cat) => {
                const checked = categoryFilters.includes(cat);
                return (
                  <label key={cat} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
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
                  className="text-indigo-600 text-sm font-semibold hover:underline"
                >
                  {showAllCategories ? 'Show less' : 'Show more'}
                </button>
              </div>
            )}
          </div>

          {renderContent()}
          
        </div>
      </main>
      <Footer />
      
      <ChallengeDetailModal 
        challenge={selectedChallenge} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default ChallengesPage;