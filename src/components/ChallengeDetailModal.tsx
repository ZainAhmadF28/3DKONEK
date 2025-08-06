'use client';

import React, { useState } from 'react'; // Import useState
import { FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa';
import { Challenge } from './ChallengeCard';
import ImageCarousel from './ImageCarousel';
import ImageLightbox from './ImageLightbox'; // Import lightbox

interface ModalProps {
  challenge: Challenge | null;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ModalProps> = ({ challenge, onClose }) => {
  // Tambahkan kembali state untuk lightbox
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  if (!challenge) {
    return null;
  }

  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(challenge.reward);

  const deadlineFormatted = new Date(challenge.deadline).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Fungsi untuk membuka lightbox
  const handleImageClick = (url: string) => {
    setLightboxImageUrl(url);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Teruskan fungsi handleImageClick ke carousel */}
          <ImageCarousel images={challenge.images} onImageClick={handleImageClick} />

          {/* ... sisa konten modal tetap sama ... */}
          <div className="flex justify-between items-start p-5">
            <div>
              <span className="text-sm font-semibold text-indigo-600">{challenge.category}</span>
              <h2 className="text-2xl font-bold text-[#0a2540] mt-1">{challenge.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl p-1 -mt-2 -mr-2">
              <FaTimes />
            </button>
          </div>
          <div className="px-5 pb-5 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed mb-6">{challenge.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-lg border"><p className="text-sm text-gray-600">Imbalan (Bounty)</p><p className="text-2xl font-bold text-[#ff6b35]">{rewardFormatted}</p></div>
              <div className="bg-slate-50 p-4 rounded-lg border"><p className="text-sm text-gray-600">Batas Waktu</p><p className="text-xl font-bold text-[#0a2540]">{deadlineFormatted}</p></div>
            </div>
            <div className="mt-6 border-t pt-4"><h4 className="font-semibold text-gray-800 mb-2">Lampiran & Detail Teknis</h4><p className="text-sm text-gray-500">(Area ini untuk menampilkan file yang diunggah, dimensi, material, dll.)</p></div>
          </div>
          <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg gap-4 mt-auto">
            <button className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors"><FaComments /><span>Gabung Diskusi</span></button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors"><FaPaperPlane /><span>Ajukan Proposal</span></button>
          </div>
        </div>
      </div>

      {/* Render lightbox secara kondisional */}
      {lightboxImageUrl && (
        <ImageLightbox 
          src={lightboxImageUrl} 
          alt={`Gambar untuk ${challenge.title}`} 
          onClose={() => setLightboxImageUrl(null)} 
        />
      )}
    </>
  );
};

export default ChallengeDetailModal;
