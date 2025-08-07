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
  fileUrl?: string;
  fileType?: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`/api/chat/${challengeId}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan.');
      }
      
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Gagal mengirim pesan. Silakan coba lagi.');
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
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
              <h1 className="text-xl font-bold text-slate-800">Chat Privat Proyek</h1>
              <p className="text-sm text-slate-500">Tantangan ID: {challengeId}</p>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {isLoading ? (
                <p>Memuat pesan...</p>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              ) : messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.author.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.author.id === session?.user?.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      <p className="font-bold text-sm">{msg.author.name}</p>
                      {msg.content && <p className="mb-2">{msg.content}</p>}
                      {msg.fileUrl && (
                        msg.fileType?.startsWith('image/') ? (
                          <div className="mt-2 mb-2">
                            <img 
                              src={msg.fileUrl} 
                              alt="Uploaded" 
                              className="max-w-full rounded-lg"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        ) : (
                          <div className="mt-2 mb-2">
                            <a 
                              href={msg.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              📎 Download File
                            </a>
                          </div>
                        )
                      )}
                      <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              }
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-slate-50">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    className="flex-grow p-2 border rounded-lg" 
                    placeholder="Ketik pesan..."
                  />
                  <button 
                    type="submit" 
                    className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  {selectedFile && (
                    <span className="text-sm text-slate-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
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
