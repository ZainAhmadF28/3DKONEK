'use client';

import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaComments, FaFileArchive, FaCube, FaDownload, FaFileUpload } from 'react-icons/fa';
import { Challenge } from './ChallengeCard';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

type SubmissionItem = {
  id: number;
  fileUrl: string;
  createdAt: string | Date;
  status: 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED';
  notes?: string | null;
};

interface ModalProps {
  challenge: Challenge & { submissions?: SubmissionItem[] };
  onClose: () => void;
  onSubmissionSuccess: () => void;
  onView3D: (fileUrl: string) => void;
}

const BengkelDetailModal: React.FC<ModalProps> = ({ challenge, onClose, onSubmissionSuccess, onView3D }) => {
  const { theme } = useTheme();
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!challenge) {
    return null;
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!submissionFile) {
      setError('File hasil pekerjaan (.glb) wajib diunggah.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', submissionFile);
    formData.append('notes', submissionNotes);

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/submissions`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengirimkan hasil.');
      }
      alert('Hasil pekerjaan berhasil dikirim!');
      onSubmissionSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal mengirimkan hasil.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isWorkDone = challenge.status === 'DONE' || challenge.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div className="flex justify-between items-start p-6 border-b border-white/10">
            <div>
                <p className="text-sm font-semibold text-lime-400">{challenge.category}</p>
                <h2 className="font-display text-3xl font-bold text-white mt-1">{challenge.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-lime-400 transition-colors text-2xl p-1"><FaTimes /></button>
        </div>

        {/* Konten Scrollable */}
        <div className="px-6 py-4 overflow-y-auto">
          {/* Form Pengumpulan Hasil */}
          {!isWorkDone && (
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-white mb-3">Kumpulkan Hasil Pekerjaan</h3>
              <div className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">File Hasil Desain (.glb)</label>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800 border border-gray-700">
                        <FaFileUpload className="text-lime-400 text-xl flex-shrink-0" />
                        <input type="file" onChange={handleFileChange} className="file-input" accept=".glb" required/>
                    </div>
                    {submissionFile && <p className="text-sm text-lime-300 mt-2">File dipilih: {submissionFile.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Catatan (Opsional)</label>
                  <textarea value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} rows={3} className="form-input" placeholder="Tulis catatan untuk pemberi tantangan..."/>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
            </div>
          )}

          {/* Riwayat Pengumpulan */}
          <div className="border-t border-white/10 pt-6">
             <h4 className="font-display text-xl font-bold text-white mb-3 flex items-center gap-2"><FaFileArchive /> Riwayat Pengumpulan</h4>
             {challenge.submissions && challenge.submissions.length > 0 ? (
                <ul className="space-y-3 text-sm max-h-48 overflow-y-auto pr-2">
                    {challenge.submissions.map(sub => (
                        <li key={sub.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex justify-between items-center">
                            <div>
                                <p className="text-gray-400 text-xs mb-1">Dikirim pada: {new Date(sub.createdAt).toLocaleString('id-ID')}</p>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => onView3D(sub.fileUrl)} className="text-lime-400 hover:underline font-semibold inline-flex items-center gap-1.5 text-sm"><FaCube /> Lihat 3D</button>
                                    <a href={sub.fileUrl} download className="text-gray-400 hover:underline font-semibold inline-flex items-center gap-1.5 text-sm"><FaDownload /> Unduh</a>
                                </div>
                            </div>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${sub.status === 'APPROVED' ? theme === 'light' ? 'bg-blue-500/20 text-blue-600' : 'bg-green-500/20 text-green-300' : sub.status === 'REVISION_REQUESTED' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>{sub.status}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-sm text-gray-500">Belum ada hasil yang dikumpulkan.</p>
             )}
          </div>
        </div>
        
        {/* Footer Modal */}
        <div className="flex justify-between items-center p-4 border-t border-white/10 bg-gray-900/50 rounded-b-2xl mt-auto">
          <Link href={`/chat/${challenge.id}`} className="btn-secondary"><FaComments /><span>Diskusi</span></Link>
          {!isWorkDone && (
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
              <FaPaperPlane /><span>{isSubmitting ? 'Mengirim...' : 'Kirim Hasil'}</span>
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        .glass-card { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 0.5rem; padding: 0.75rem 1rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary:hover { transform: scale(1.05); }
        .btn-primary:disabled { background-color: #4b5563; color: #9ca3af; cursor: not-allowed; }
        .btn-secondary { background-color: transparent; border: 1px solid #4b5563; color: #d1d5db; font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-secondary:hover { background-color: #374151; border-color: #6b7280; }
        .file-input::file-selector-button { background-color: #374151; border: none; color: #9EFF00; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; margin-right: 1rem; cursor: pointer; transition: background-color 0.2s; }
        .file-input::file-selector-button:hover { background-color: #4b5563; }
      `}</style>
    </div>
  );
};

export default BengkelDetailModal;
