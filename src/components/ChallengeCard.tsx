import React from 'react';
import { FaEye, FaUsers, FaClock } from 'react-icons/fa';

export interface Challenge {
  id: number;
  title: string;
  category: string;
  description: string;
  reward: number;
  deadline: string;
  views: number;
  participants: number;
  status: 'Open' | 'Judging' | 'Completed';
}

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: () => void; // Fungsi yang dipanggil saat kartu diklik
}

const statusStyles = {
  Open: 'bg-green-100 text-green-800',
  Judging: 'bg-blue-100 text-blue-800',
  Completed: 'bg-gray-100 text-gray-800',
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(challenge.reward);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-semibold text-indigo-600">{challenge.category}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[challenge.status]}`}>
            {challenge.status}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#0a2540] mb-2">{challenge.title}</h3>
        <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">{challenge.description}</p>
        
        <div className="text-2xl font-bold text-[#ff6b35] mb-4">
          {rewardFormatted}
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <FaClock className="mr-2" />
          <span>Deadline: {challenge.deadline}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center"><FaEye className="mr-1.5" /> {challenge.views}</span>
          <span className="flex items-center"><FaUsers className="mr-1.5" /> {challenge.participants}</span>
        </div>
        <span className="font-semibold text-indigo-600">Lihat Detail &rarr;</span>
      </div>
    </div>
  );
};

export default ChallengeCard;