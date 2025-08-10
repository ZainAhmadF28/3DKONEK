'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaPaperPlane, FaArrowLeft, FaPaperclip, FaCube } from 'react-icons/fa';
import ThreeDViewerModal from '@/components/ThreeDViewerModal';
import Image from 'next/image';

// Tipe data untuk pesan
interface Message {
  id: number;
  content: string | null;
  createdAt: string;
  sender: {
    id: number;
    name: string | null;
  };
  fileUrl?: string | null;
  fileType?: string | null;
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
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null);

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
          if (!res.ok) throw new Error('Gagal memuat pesan atau Anda tidak memiliki akses.');
          setMessages(await res.json());
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMessages();
    }
  }, [status, challengeId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const formData = new FormData();
    if (newMessage.trim()) formData.append('content', newMessage.trim());
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const res = await fetch(`/api/chat/${challengeId}`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Gagal mengirim pesan.');
      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage('');
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Memuat...</div>;
  }

  return (
    <>
      <div className="bg-gray-900 min-h-screen text-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-28 pb-20">
          <div className="container mx-auto px-8 max-w-4xl">
            <Link href="/akun/dashboard" className="inline-flex items-center gap-2 text-lime-400 font-semibold mb-6 hover:underline">
              <FaArrowLeft /> Kembali ke Dashboard
            </Link>
            <div className="glass-card rounded-2xl flex flex-col h-[75vh]">
              <div className="p-4 border-b border-white/10">
                <h1 className="font-display text-xl font-bold text-white">Ruang Diskusi Proyek</h1>
                <p className="text-sm text-gray-400">Tantangan ID: {challengeId}</p>
              </div>
              
              <div className="flex-grow p-4 overflow-y-auto space-y-6">
                {isLoading ? <p className="text-center text-gray-400">Memuat pesan...</p> : error ? <p className="text-red-400 text-center">{error}</p> :
                  messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-3 rounded-xl ${msg.sender.id === session?.user?.id ? 'bg-lime-400/90 text-gray-900' : 'bg-gray-700 text-gray-200'}`}>
                        <p className="font-bold text-sm">{msg.sender.name}</p>
                        {msg.content && <p className="whitespace-pre-wrap break-words mt-1">{msg.content}</p>}
                        {msg.fileUrl && (
                          <div className="mt-2">
                            {msg.fileType?.startsWith('image/') ? (
                              <div className="relative w-full h-64"><Image src={msg.fileUrl} alt="Lampiran" fill className="object-contain rounded-md" /></div>
                            ) : msg.fileType === 'model/gltf-binary' || msg.fileUrl.endsWith('.glb') ? (
                              <button onClick={() => setModelViewerSrc(msg.fileUrl || null)} className={`mt-1 inline-flex items-center gap-2 text-sm font-semibold ${msg.sender.id === session?.user?.id ? 'text-gray-800 hover:text-black' : 'text-lime-400 hover:text-lime-300'}`}><FaCube/> Lihat Model 3D</button>
                            ) : (
                              <a href={msg.fileUrl} download className={`mt-1 inline-flex items-center gap-2 text-sm font-semibold ${msg.sender.id === session?.user?.id ? 'text-gray-800 hover:text-black' : 'text-lime-400 hover:text-lime-300'}`}>Unduh lampiran</a>
                            )}
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-2 text-right">{new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                }
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/10 bg-gray-900/50 rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary !p-0 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full">
                    <FaPaperclip />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="hidden" accept="image/*,.glb"/>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="form-input flex-grow" placeholder="Ketik pesan..."/>
                  <button type="submit" className="btn-primary !p-0 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full"><FaPaperPlane /></button>
                </form>
                {selectedFile && <p className="text-xs text-lime-300 mt-2 ml-16">File dipilih: {selectedFile.name}</p>}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      {modelViewerSrc && <ThreeDViewerModal src={modelViewerSrc} onClose={() => setModelViewerSrc(null)} />}
      <style jsx global>{`
        .glass-card { background: rgba(31, 41, 55, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        body { font-family: 'Inter', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 9999px; padding: 0.75rem 1.25rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; transition: all 0.2s; }
        .btn-primary:hover { transform: scale(1.1); }
        .btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; transition: all 0.2s; }
        .btn-secondary:hover { background-color: #4b5563; border-color: #6b7280; }
      `}</style>
    </>
  );
};

export default PrivateChatPage;
