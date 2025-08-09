'use client';

import React from 'react';
import ImageCarousel from './ImageCarousel';

// Perbarui tipe Challenge untuk menyertakan data baru
export interface Challenge {
  id: number;
  title: string;
  category: string;
  images: { url: string }[];
  description: string;
  material: string | null;
  reward: number;
  deadline: string | Date;
  status: string;
  challenger?: { name: string | null };
  _count?: { views: number };
}

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: () => void;
}

const statusStyles: { [key: string]: string } = {
  OPEN: 'bg-lime-400/20 text-lime-300 border border-lime-400/30',
  JUDGING: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30',
  COMPLETED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(challenge.reward);

  const statusKey = (challenge.status || '').toUpperCase();

  return (
    <div
      onClick={onClick}
      className="glass-card p-6 rounded-2xl border-t-2 border-lime-400 transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer flex flex-col group"
    >
      <div className="rounded-xl overflow-hidden mb-4">
        <ImageCarousel images={challenge.images} onImageClick={() => {}} />
      </div>

      {/* Judul */}
      <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-lime-400 transition-colors duration-300">
        {challenge.title}
      </h3>

      {/* Deskripsi */}
      <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-grow line-clamp-3">
        {challenge.description}
      </p>

      {/* Kategori */}
      <div className="flex flex-wrap gap-2 mb-4">
        {challenge.category && (
          <span className="text-xs bg-gray-700 text-lime-400 font-semibold py-1 px-3 rounded-full">
            {challenge.category}
          </span>
        )}
      </div>

      {/* Footer: Imbalan & Status */}
      <div className="mt-auto pt-4 border-t border-white/10 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">Imbalan</p>
          <p className="text-xl font-bold text-white">{rewardFormatted}</p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            statusStyles[statusKey] || statusStyles.COMPLETED
          }`}
        >
          {challenge.status}
        </span>
      </div>
    </div>
  );
};

export default ChallengeCard;