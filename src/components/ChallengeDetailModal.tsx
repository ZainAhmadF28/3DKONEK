import React from 'react';
import { FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa';
import { Challenge } from './ChallengeCard'; // Import tipe data dari ChallengeCard

interface ModalProps {
  challenge: Challenge | null;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ModalProps> = ({ challenge, onClose }) => {
  if (!challenge) {
    return null;
  }

  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(challenge.reward);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold text-[#0a2540]">{challenge.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <span className="text-sm font-semibold text-indigo-600">{challenge.category}</span>
            <p className="mt-4 text-gray-700 leading-relaxed">
              {challenge.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Imbalan (Bounty)</p>
                <p className="text-2xl font-bold text-[#ff6b35]">{rewardFormatted}</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Batas Waktu</p>
                <p className="text-2xl font-bold text-[#0a2540]">{challenge.deadline}</p>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <h4 className="font-bold text-lg mb-2">Lampiran & Detail Teknis</h4>
            <p className="text-sm text-gray-500">
                (Area ini untuk menampilkan file yang diunggah, dimensi, material, dll.)
            </p>
          </div>
        </div>

        <div className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg gap-4">
          <button className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200">
            <FaComments />
            <span>Gabung Diskusi</span>
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors">
            <FaPaperPlane />
            <span>Ajukan Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal;