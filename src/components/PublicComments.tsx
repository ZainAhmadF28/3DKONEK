'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

// Tipe data untuk komentar, disesuaikan dengan respons API
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: { 
    name: string | null; 
  };
}

interface PublicCommentsProps {
  challengeId: number;
}

const PublicComments: React.FC<PublicCommentsProps> = ({ challengeId }) => {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (error) {
      console.error('Gagal memuat komentar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) fetchComments();
  }, [challengeId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment('');
      } else {
        alert('Gagal mengirim komentar.');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim komentar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-white/10 pt-6 mt-6">
      <h3 className="font-display text-xl font-bold text-white mb-4">Komentar Publik</h3>
      
      {/* Daftar Komentar */}
      <div className="space-y-4 max-h-60 overflow-y-auto p-2 pr-4 rounded-lg bg-gray-900/50">
        {isLoading ? (
          <p className="text-sm text-center text-gray-400 py-4">Memuat komentar...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <FaUserCircle size={32} className="text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-1 bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{comment.user.name || 'Anonim'}</p>
                    <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('id-ID', { hour:'2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-gray-500 py-8">Belum ada komentar. Jadilah yang pertama!</p>
        )}
      </div>

      {/* Form Input Komentar */}
      {status === 'authenticated' ? (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-input flex-grow"
            placeholder="Tulis komentar..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn-primary !p-0 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full"
          >
            {isSubmitting ? '...' : <FaPaperPlane />}
          </button>
        </form>
      ) : (
        <div className="text-sm text-center mt-4 p-4 bg-gray-800/50 rounded-lg">
          <Link href="/login" className="font-semibold text-lime-400 hover:underline">
            Login
          </Link>
          <span className="text-gray-400"> untuk ikut berkomentar.</span>
        </div>
      )}

      {/* Style lokal untuk komponen ini */}
      <style jsx>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 9999px; padding: 0.75rem 1.25rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; transition: all 0.2s; }
        .btn-primary:hover { transform: scale(1.1); }
        .btn-primary:disabled { background-color: #4b5563; color: #9ca3af; cursor: not-allowed; transform: scale(1); }
      `}</style>
    </div>
  );
};

export default PublicComments;
