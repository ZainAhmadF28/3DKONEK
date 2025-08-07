'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTimes, FaShareAlt, FaUser, FaEye, FaCogs, FaPaperPlane, FaComments } from 'react-icons/fa';
import { Challenge } from './ChallengeCard';
import ImageCarousel from './ImageCarousel';
import ImageLightbox from './ImageLightbox';

interface ModalProps {
  challenge: Challenge | null;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ModalProps> = ({ challenge, onClose }) => {
  const { data: session } = useSession();
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (challenge && session) {
      fetch(`/api/challenges/${challenge.id}/view`, { method: 'POST' });
    }
  }, [challenge, session]);

  if (!challenge) {
    return null;
  }

  const handleProposalSubmit = async () => {
      if (!proposalMessage) {
          setError("Silakan tulis pesan singkat untuk proposal Anda.");
          return;
      }
      setIsSubmitting(true);
      setError('');
      try {
          const res = await fetch(`/api/challenges/${challenge.id}/proposals`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: proposalMessage }),
          });
          if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || 'Gagal mengajukan proposal.');
          }
          alert('Proposal berhasil diajukan!');
          onClose(); // Tutup modal setelah berhasil
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const rewardFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(challenge.reward);

  const deadlineFormatted = new Date(challenge.deadline).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/tantangan/${challenge.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link tantangan disalin ke clipboard!');
    });
  };

  // Tentukan apakah tombol "Ajukan Proposal" harus ditampilkan
  const canSubmitProposal = session && session.user.id !== challenge.challenger?.id && challenge.status === 'OPEN';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageCarousel images={challenge.images} onImageClick={(url) => setLightboxImageUrl(url)} />

          <div className="flex justify-between items-start p-5">
            <div>
              <span className="text-sm font-semibold text-indigo-600">{challenge.category}</span>
              <h2 className="text-2xl font-bold text-[#0a2540] mt-1">{challenge.title}</h2>
              <div className="flex items-center text-sm text-gray-500 gap-4 mt-2">
                <span className="flex items-center gap-1.5"><FaUser /> Dibuat oleh {challenge.challenger?.name || 'Anonim'}</span>
                <span className="flex items-center gap-1.5"><FaEye /> Dilihat oleh {challenge._count?.views || 0} pengguna</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl p-1 -mt-2 -mr-2">
              <FaTimes />
            </button>
          </div>

          <div className="px-5 pb-5 overflow-y-auto">
            <p className="text-gray-700 leading-relaxed mb-6">{challenge.description}</p>
            
            {challenge.material && (
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaCogs /> Material yang Diinginkan</h4>
                    <p className="text-gray-600 bg-slate-50 p-3 rounded-lg border">{challenge.material}</p>
                </div>
            )}

            {/* Form untuk mengajukan proposal */}
            {canSubmitProposal && (
                <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Ajukan Proposal</h4>
                    <p className="text-sm text-gray-500 mb-2">Tulis pesan singkat kepada pemberi tantangan mengapa Anda adalah orang yang tepat.</p>
                    <textarea 
                        value={proposalMessage}
                        onChange={(e) => setProposalMessage(e.target.value)}
                        rows={3}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Contoh: Saya memiliki pengalaman 5 tahun di bidang permesinan dan memiliki akses ke bengkel CNC..."
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
            )}
          </div>

          <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg gap-4 mt-auto">
            <div>
              <button onClick={handleShare} className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors">
                <FaShareAlt />
                <span>Bagikan</span>
              </button>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors">
                    <FaComments /><span>Gabung Diskusi</span>
                </button>
                {canSubmitProposal && (
                    <button 
                        onClick={handleProposalSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        <FaPaperPlane /><span>{isSubmitting ? 'Mengirim...' : 'Ajukan Proposal'}</span>
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>

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
