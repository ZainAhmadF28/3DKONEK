'use client';

import React from 'react';
import Image from 'next/image';
import { FaEye, FaUsers } from 'react-icons/fa';

export interface Challenge {
  id: number;
  title: string;
  category: string;
  images: { url: string }[]; // Diubah dari imageUrl
  description: string;
  reward: number;
  deadline: string | Date;
  status: string;
  // Properti opsional dari relasi
  challenger?: { name: string | null; };
  participants?: number; // Asumsi
  views?: number; // Asumsi
}

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: () => void;
}

const statusStyles: { [key: string]: string } = {
  Open: 'bg-green-100 text-green-800',
  Judging: 'bg-blue-100 text-blue-800',
  Completed: 'bg-gray-100 text-gray-800',
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(challenge.reward);

  // Ambil gambar pertama sebagai thumbnail
  const thumbnailUrl = challenge.images && challenge.images.length > 0 ? challenge.images[0].url : null;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group"
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-200">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Gambar untuk ${challenge.title}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Tidak Ada Gambar</div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-semibold text-indigo-600">{challenge.category}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[challenge.status] || 'bg-gray-100 text-gray-800'}`}>
            {challenge.status}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#0a2540] mb-2 h-14 overflow-hidden">{challenge.title}</h3>
        <div className="text-2xl font-bold text-[#ff6b35] mt-auto pt-4">
          {rewardFormatted}
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center" title="Dilihat"><FaEye className="mr-1.5" /> {challenge.views || 0}</span>
          <span className="flex items-center" title="Peserta"><FaUsers className="mr-1.5" /> {challenge.participants || 0}</span>
        </div>
        <span className="font-semibold text-indigo-600">Lihat Detail &rarr;</span>
      </div>
    </div>
  );
};

export default ChallengeCard;
