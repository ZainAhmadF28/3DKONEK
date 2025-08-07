'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    name: string | null;
  };
}

const PrivateChatPage = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const challengeId = params.challengeId as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && challengeId) {
      const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/chat/${challengeId}`);
          if (!res.ok) {
            throw new Error('Gagal memuat pesan atau Anda tidak memiliki akses.');
          }
          const data = await res.json();
          setMessages(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMessages();
    }
  }, [status, challengeId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/chat/${challengeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
      if (!res.ok) {
        throw new Error('Gagal mengirim pesan.');
      }
      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link href="/akun/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-4 hover:underline">
            <FaArrowLeft /> Kembali ke Dashboard
          </Link>
          <div className="bg-white rounded-lg shadow-md flex flex-col h-[70vh]">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-slate-800">Diskusi Privat</h1>
              <p className="text-sm text-slate-500">Tantangan ID: {challengeId}</p>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {isLoading ? <p>Memuat pesan...</p> : error ? <p className="text-red-500">{error}</p> :
                messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.author.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.author.id === session?.user?.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      <p className="font-bold text-sm">{msg.author.name}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-slate-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-grow p-2 border rounded-lg" placeholder="Ketik pesan..."/>
                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"><FaPaperPlane /></button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivateChatPage;
