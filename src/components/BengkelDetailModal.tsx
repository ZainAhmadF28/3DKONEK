'use client';

import React, { useState } from 'react';
// ... (imports tetap sama)
import { useSession } from 'next-auth/react';
import { FaTimes, FaFileUpload, FaPaperPlane, FaComments, FaFileArchive } from 'react-icons/fa';
import { Challenge } from './ChallengeCard';
import ImageCarousel from './ImageCarousel';

interface ModalProps {
  challenge: Challenge & { submissions?: any[] }; // Tipe diperluas untuk submissions
  onClose: () => void;
  onSubmissionSuccess: () => void;
}

const BengkelDetailModal: React.FC<ModalProps> = ({ challenge, onClose, onSubmissionSuccess }) => {
  const { data: session } = useSession();
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isWorkDone = challenge.status === 'DONE' || challenge.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <ImageCarousel images={challenge.images} onImageClick={() => {}} />
        <div className="flex justify-between items-start p-5">
          <div><span className="text-sm font-semibold text-indigo-600">{challenge.category}</span><h2 className="text-2xl font-bold text-[#0a2540] mt-1">{challenge.title}</h2></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl p-1 -mt-2 -mr-2"><FaTimes /></button>
        </div>
        <div className="px-5 pb-5 overflow-y-auto">
          {/* Form untuk Submit Pekerjaan */}
          {!isWorkDone && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Kumpulkan Hasil Pekerjaan</h3>
              <div className="mb-4">
                <label htmlFor="submissionFile" className="block text-gray-700 font-semibold text-sm mb-1">File Hasil Desain (.glb)</label>
                <input type="file" name="submissionFile" id="submissionFile" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept=".glb" required/>
                {submissionFile && <p className="text-sm text-gray-600 mt-2">File dipilih: {submissionFile.name}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="submissionNotes" className="block text-gray-700 font-semibold text-sm mb-1">Catatan (Opsional)</label>
                <textarea value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-lg" placeholder="Tulis catatan untuk pemberi tantangan..."/>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          )}

          {/* Riwayat Submission */}
          <div className="mt-4 border-t pt-4">
             <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaFileArchive /> Riwayat Pengumpulan</h4>
             {challenge.submissions && challenge.submissions.length > 0 ? (
                <ul className="space-y-2 text-sm">
                    {challenge.submissions.map(sub => (
                        <li key={sub.id} className="p-2 bg-slate-50 rounded-md border flex justify-between items-center">
                            <div>
                                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">Lihat File Submission</a>
                                <p className="text-gray-500 text-xs">Dikirim pada: {new Date(sub.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${sub.status === 'APPROVED' ? 'bg-green-100 text-green-800' : sub.status === 'REVISION_REQUESTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{sub.status}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-sm text-gray-500">Belum ada hasil yang dikumpulkan.</p>
             )}
          </div>
        </div>
        <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg gap-4 mt-auto">
          <button className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-200"><FaComments /><span>Diskusi</span></button>
          {!isWorkDone && (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
              <FaPaperPlane /><span>{isSubmitting ? 'Mengirim...' : 'Kirim Hasil'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BengkelDetailModal;
