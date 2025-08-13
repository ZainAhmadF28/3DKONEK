'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
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
    <div className={`border-t pt-6 mt-6 ${
      theme === 'light' ? 'border-gray-200' : 'border-white/10'
    }`}>
      <h3 className={`font-display text-xl font-bold mb-4 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`}>Komentar Publik</h3>
      
      {/* Daftar Komentar */}
      <div className={`space-y-4 max-h-60 overflow-y-auto p-2 pr-4 rounded-lg ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900/50'
      }`}>
        {isLoading ? (
          <p className={`text-sm text-center py-4 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>Memuat komentar...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <FaUserCircle size={32} className={`mt-1 flex-shrink-0 ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div className={`flex-1 p-3 rounded-lg ${
                theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-700/50'
              }`}>
                <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>{comment.user.name || 'Anonim'}</p>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                    }`}>{new Date(comment.createdAt).toLocaleString('id-ID', { hour:'2-digit', minute: '2-digit' })}</p>
                </div>
                <p className={`text-sm mt-1 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={`text-sm text-center py-8 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-500'
          }`}>Belum ada komentar. Jadilah yang pertama!</p>
        )}
      </div>

      {/* Form Input Komentar */}
      {status === 'authenticated' ? (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`flex-grow px-5 py-3 rounded-full transition-all duration-200 ${
              theme === 'light' 
                ? 'bg-white border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                : 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/40'
            }`}
            placeholder="Tulis komentar..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full font-bold transition-all duration-200 ${
              isSubmitting || !newComment.trim()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : theme === 'light'
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'
                : 'bg-lime-400 text-gray-900 hover:bg-lime-300 hover:scale-110'
            }`}
          >
            {isSubmitting ? '...' : <FaPaperPlane />}
          </button>
        </form>
      ) : (
        <div className={`text-sm text-center mt-4 p-4 rounded-lg ${
          theme === 'light' ? 'bg-gray-100 border border-gray-200' : 'bg-gray-800/50'
        }`}>
          <Link href="/login" className={`font-semibold hover:underline ${
            theme === 'light' ? 'text-blue-600' : 'text-lime-400'
          }`}>
            Login
          </Link>
          <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}> untuk ikut berkomentar.</span>
        </div>
      )}
    </div>
  );
};

export default PublicComments;