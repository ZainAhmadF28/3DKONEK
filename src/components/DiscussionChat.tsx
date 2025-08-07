'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

// Tipe data untuk pesan
interface Message {
  id: number;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    image?: string | null;
  };
}

interface DiscussionChatProps {
  challengeId: number;
}

const DiscussionChat: React.FC<DiscussionChatProps> = ({ challengeId }) => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil pesan dari API
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Gagal memuat pesan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchMessages();
    }
  }, [challengeId]);

  // Fungsi untuk mengirim pesan baru
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        // Optimistic UI update: langsung tambahkan pesan baru ke daftar
        setMessages((prevMessages) => [...prevMessages, savedMessage]);
        setNewMessage('');
      } else {
        alert('Gagal mengirim pesan.');
      }
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
      alert('Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold text-gray-800 mb-4">Diskusi Tantangan</h4>
      
      {/* Daftar Pesan */}
      <div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat diskusi...</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <FaUserCircle size={24} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-800">{msg.author.name || 'Anonim'}</p>
                <p className="text-sm text-slate-700 bg-white p-2 rounded-lg">{msg.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">Belum ada diskusi. Jadilah yang pertama!</p>
        )}
      </div>

      {/* Form Kirim Pesan */}
      {status === 'authenticated' ? (
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-2 border rounded-lg"
            placeholder="Tulis pesan Anda..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-12"
          >
            {isSubmitting ? '...' : <FaPaperPlane />}
          </button>
        </form>
      ) : (
        <p className="text-sm text-center mt-4 p-3 bg-gray-100 rounded-lg">
          <Link href="/login" className="text-indigo-600 font-semibold">Login</Link> untuk berpartisipasi dalam diskusi.
        </p>
      )}
    </div>
  );
};

export default DiscussionChat;
