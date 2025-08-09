'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTimes, FaShareAlt, FaUser, FaEye, FaPaperPlane } from 'react-icons/fa';
import { Challenge } from './ChallengeCard';
import ImageCarousel from './ImageCarousel';
import ImageLightbox from './ImageLightbox';
import PublicComments from './PublicComments'; // Menggunakan komponen Komentar Publik yang baru

interface ModalProps {
  challenge: Challenge | null;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ModalProps> = ({ challenge, onClose }) => {
  const { data: session } = useSession();
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (challenge && session) {
      fetch(`/api/challenges/${challenge.id}/view`, { method: 'POST' });
    }
  }, [challenge, session]);

  if (!challenge) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProposalFile(e.target.files[0]);
    }
  };

  const handleProposalSubmit = async () => {
    if (!proposalMessage) {
      setError("Pesan singkat wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('message', proposalMessage);
    if (proposalFile) {
      formData.append('file', proposalFile);
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/proposals`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengajukan proposal.');
      }
      alert('Proposal berhasil diajukan!');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengajukan proposal.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // formatters tidak digunakan di UI saat ini

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/tantangan/${challenge.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link tantangan disalin ke clipboard!');
    });
  };

  const canSubmitProposal =
    !!session &&
    (session.user.role === 'DESAINER' || session.user.role === 'ADMIN') &&
    challenge.status === 'OPEN';

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-white/10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">{challenge.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-gray-700 text-lime-400 font-semibold py-1 px-3 rounded-full">{challenge.category}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-lime-400 transition-colors text-2xl p-1">
              <FaTimes />
            </button>
          </div>

          {/* Carousel gambar dirapikan: tinggi lebih kecil, contain, dan center */}
          <div className="px-6 pt-4">
            <div className="rounded-xl overflow-hidden bg-gray-900/40">
              <ImageCarousel
                images={challenge.images}
                onImageClick={(url) => setLightboxImageUrl(url)}
                heightClassName="h-64 md:h-72"
                fit="contain"
                roundedClassName="rounded-xl"
              />
            </div>
          </div>

          {/* Konten */}
          <div className="px-6 py-4 overflow-y-auto">
            <h3 className="font-display text-xl font-bold text-white mb-2">Deskripsi Tantangan</h3>
            <p className="text-gray-300 leading-relaxed mb-6">{challenge.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="glass-card p-4 rounded-lg">
                <h4 className="font-semibold text-gray-400 text-sm mb-1">Imbalan</h4>
                <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(challenge.reward)}</p>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <h4 className="font-semibold text-gray-400 text-sm mb-1">Status</h4>
                <p className="text-2xl font-bold text-white">{challenge.status}</p>
              </div>
            </div>

            {challenge.material && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-200 mb-2 flex items-center gap-2">Material yang Diinginkan</h4>
                <p className="text-gray-200/80 bg-gray-700/50 p-3 rounded-lg border border-white/10">{challenge.material}</p>
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center text-sm text-gray-300 gap-4 mb-4">
                <span className="flex items-center gap-1.5"><FaUser /> Dibuat oleh {challenge.challenger?.name || 'Anonim'}</span>
                <span className="flex items-center gap-1.5"><FaEye /> Dilihat oleh {challenge._count?.views || 0} pengguna</span>
              </div>

              {/* Komentar publik tetap ditampilkan */}
              <PublicComments challengeId={challenge.id} />

              {canSubmitProposal && (
                <div className="mt-6 border-t border-white/10 pt-4">
                  <h4 className="font-display text-xl font-bold text-white mb-3">Ajukan Proposal</h4>
                  <p className="text-sm text-gray-400 mb-2">Tulis pesan singkat dan unggah file proposal (PDF) jika ada.</p>
                  <textarea
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition"
                    placeholder="Tuliskan pesan singkat mengenai proposal Anda..."
                  />
                  <div className="mt-2">
                    <label htmlFor="proposalFile" className="block text-gray-300 font-semibold text-sm mb-1">File Proposal (PDF, Opsional)</label>
                    <input
                      type="file"
                      name="proposalFile"
                      id="proposalFile"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-100 file:text-gray-900 hover:file:bg-lime-200"
                      accept=".pdf"
                    />
                  </div>
                  {proposalFile && <p className="text-sm text-gray-300 mt-2">File dipilih: {proposalFile.name}</p>}
                  {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-white/10 bg-gray-900/50 rounded-b-2xl gap-4 mt-auto">
            <div>
              <button onClick={handleShare} className="flex items-center gap-2 text-gray-300 font-semibold py-2 px-5 rounded-lg hover:bg-gray-700 transition-colors">
                <FaShareAlt /><span>Bagikan</span>
              </button>
            </div>
            <div className="flex gap-2">
              {canSubmitProposal && (
                <button
                  onClick={handleProposalSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-lime-400 text-gray-900 font-bold py-2 px-5 rounded-lg hover:bg-lime-300 disabled:opacity-70 transition-transform duration-300 hover:scale-105"
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
