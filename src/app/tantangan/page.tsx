'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ChallengeDetailModal from '@/components/ChallengeDetailModal';

const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: "Desain Ulang Roda Gigi Reducer Mesin Penggiling Tebu",
    category: "Gear & Transmisi",
    description: "Mesin penggiling tebu produksi lama membutuhkan desain roda gigi pengganti karena komponen asli sudah tidak diproduksi dan sering aus. Material saat ini adalah baja ST41, diharapkan bisa menggunakan S45C atau material lain yang lebih tahan gesekan dengan biaya produksi yang efisien.",
    reward: 2000000,
    deadline: "20 Agustus 2025",
    views: 142,
    participants: 8,
    status: 'Open',
  },
  {
    id: 2,
    title: "Pengganti Modul Kontrol Mesin CNC Jadul",
    category: "Komponen Mesin",
    description: "Mencari solusi untuk modul kontrol mesin CNC yang rusak dengan alternatif lokal yang lebih terjangkau dan mudah diperbaiki. Modul asli berbasis mikrokontroler yang sudah usang dan sulit ditemukan.",
    reward: 3500000,
    deadline: "25 September 2025",
    views: 98,
    participants: 5,
    status: 'Open',
  },
  {
    id: 3,
    title: "Cetakan Plastik Injection Molding untuk Produk Rumah Tangga",
    category: "Moulding & Cetakan",
    description: "Membutuhkan desain cetakan plastik untuk produk rumah tangga baru dengan material lokal yang tahan panas dan benturan. Produk memiliki detail kecil yang membutuhkan presisi tinggi dari cetakan.",
    reward: 5000000,
    deadline: "10 September 2025",
    views: 210,
    participants: 12,
    status: 'Judging',
  },
  {
    id: 4,
    title: "Bilah Turbin Angin Skala Kecil untuk Pedesaan",
    category: "Prototipe Produk",
    description: "Desain bilah turbin angin efisien untuk pembangkit listrik skala UKM menggunakan material komposit lokal yang ringan namun kuat menahan terpaan angin.",
    reward: 4200000,
    deadline: "15 Agustus 2025",
    views: 178,
    participants: 7,
    status: 'Completed',
  },
];

const ChallengesPage = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };
  
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

  return (
    <div className="bg-slate-50">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a2540]" style={{ fontFamily: "'Raleway', sans-serif" }}>
              Papan Tantangan
            </h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Temukan masalah industri, ajukan solusi rekayasa Anda, dan dapatkan imbalan.
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
              <button className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-full">Semua</button>
              <button className="bg-white hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full border">Gear & Transmisi</button>
              <button className="bg-white hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full border">Komponen Mesin</button>
              <button className="bg-white hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full border">Moulding</button>
              <button className="bg-white hover:bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full border">Prototipe</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockChallenges.map((challenge) => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                onClick={() => handleCardClick(challenge)}
              />
            ))}
          </div>
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