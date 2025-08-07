'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: { name: string | null; };
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
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold text-gray-800 mb-4">Komentar Publik</h4>
      <div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat komentar...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <FaUserCircle size={24} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-800">{comment.author.name || 'Anonim'}</p>
                <p className="text-sm text-slate-700 bg-white p-2 rounded-lg">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">Belum ada komentar. Jadilah yang pertama!</p>
        )}
      </div>

      {status === 'authenticated' ? (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-grow p-2 border rounded-lg" placeholder="Tulis komentar..." disabled={isSubmitting}/>
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-12">
            {isSubmitting ? '...' : <FaPaperPlane />}
          </button>
        </form>
      ) : (
        <p className="text-sm text-center mt-4 p-3 bg-gray-100 rounded-lg">
          <Link href="/login" className="text-indigo-600 font-semibold">Login</Link> untuk ikut berkomentar.
        </p>
      )}
    </div>
  );
};

export default PublicComments;
