'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPaperPlane, FaUserCircle, FaFileAlt, FaCube, FaTimes, FaPlus, FaImage, FaArrowLeft } from 'react-icons/fa';
import ThreeDViewerModal from './ThreeDViewerModal';
import ModelViewer from './ModelViewer';
import { useForum } from '@/context/ForumContext';

interface Post {
  id: number;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  createdAt: string;
  author: { name: string | null };
  community?: { id: number; name: string } | null;
}

interface Community { id: number; name: string; description: string | null; avatarUrl?: string | null }

const ForumSidebar = () => {
  const { isForumOpen, closeForum } = useForum();
  const { status, data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | 'all'>('all');
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityAvatar, setNewCommunityAvatar] = useState<File | null>(null);
  const [isMobileCommunitiesView, setIsMobileCommunitiesView] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isForumOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [postsRes, commsRes] = await Promise.all([
            fetch(`/api/forum${selectedCommunityId === 'all' ? '' : `?communityId=${selectedCommunityId}`}`),
            fetch('/api/forum/communities'),
          ]);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            // Urutkan posts dari yang terlama ke terbaru (terbaru di bawah)
            setPosts(postsData.sort((a: Post, b: Post) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
          }
          if (commsRes.ok) setCommunities(await commsRes.json());
        } catch {
          console.error('Gagal memuat forum');
        }
        finally { setIsLoading(false); }
      };
      fetchData();
    }
  }, [isForumOpen, selectedCommunityId]);

  // Auto scroll ke bawah ketika ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostFile) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostFile) formData.append('file', newPostFile);
    if (selectedCommunityId !== 'all') formData.append('communityId', String(selectedCommunityId));

    try {
      const res = await fetch('/api/forum', { method: 'POST', body: formData });
      if (res.ok) {
        const newPost = await res.json();
        // Tambahkan pesan baru di akhir array (terbaru di bawah)
        setPosts(prev => [...prev, newPost]);
        setNewPostContent('');
        setNewPostFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else { alert('Gagal mengirim postingan.'); }
    } catch {
      alert('Terjadi kesalahan.');
    }
    finally { setIsSubmitting(false); }
  };

  const renderAttachment = (post: Post) => {
    if (!post.fileUrl || !post.fileType) return null;
    
    if (post.fileType.startsWith('image/')) {
      return (
        <div className="relative mt-2 max-w-xs rounded-lg overflow-hidden">
          <Image 
            src={post.fileUrl} 
            alt="Lampiran gambar" 
            width={300} 
            height={200} 
            className="object-cover rounded-lg cursor-pointer hover:opacity-90" 
            onClick={() => post.fileUrl && window.open(post.fileUrl, '_blank')}
          />
        </div>
      );
    }
    
    if (post.fileType === 'model/gltf-binary' || post.fileUrl.endsWith('.glb') || post.fileUrl.endsWith('.gltf')) {
      return (
        <div className="mt-2 bg-gray-800 rounded-lg p-2">
          <div className="w-full h-48 rounded-lg overflow-hidden mb-2">
            <ModelViewer src={post.fileUrl} alt="3D Model" />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setModelViewerSrc(post.fileUrl)} 
              className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline text-sm"
            >
              <FaCube /> Lihat Fullscreen
            </button>
            <a href={post.fileUrl} download className="text-sm text-gray-400 hover:underline">
              Unduh
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <a 
        href={post.fileUrl} 
        download 
        className="mt-2 inline-flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        <FaFileAlt />
        <span className="text-sm font-semibold text-gray-200">Unduh Lampiran</span>
      </a>
    );
  };

  const renderMessage = (post: Post) => {
    const isOwnMessage = session?.user?.name === post.author.name;
    
    return (
      <div key={post.id} className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
          {!isOwnMessage && (
            <FaUserCircle size={32} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
          )}
          <div className={`rounded-lg p-3 shadow-sm ${
            isOwnMessage 
              ? 'bg-green-600 dark:bg-lime-400 text-white dark:text-gray-900' 
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            {!isOwnMessage && (
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-sm truncate">{post.author.name || 'Anonim'}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {new Date(post.createdAt).toLocaleString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            )}
            {post.community && selectedCommunityId === 'all' && (
              <p className={`text-xs font-semibold mb-1 ${isOwnMessage ? 'text-green-100 dark:text-gray-700' : 'text-green-600 dark:text-lime-400'}`}>
                #{post.community.name}
              </p>
            )}
            <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
              isOwnMessage ? 'text-white dark:text-gray-900' : 'text-gray-800 dark:text-gray-200'
            }`}>
              {post.content}
            </p>
            {renderAttachment(post)}
            {isOwnMessage && (
              <div className="flex justify-end mt-1">
                <span className="text-xs text-green-100 dark:text-gray-700">
                  {new Date(post.createdAt).toLocaleString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
          {isOwnMessage && (
            <FaUserCircle size={32} className="text-green-600 dark:text-lime-500 mt-1 flex-shrink-0" />
          )}
        </div>
      </div>
    );
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCommunityName.trim();
    if (!name) return;
    try {
      const form = new FormData();
      form.append('name', name);
      if (newCommunityDesc.trim()) form.append('description', newCommunityDesc.trim());
      if (newCommunityAvatar) form.append('avatar', newCommunityAvatar);
      const res = await fetch('/api/forum/communities', { method: 'POST', body: form });
      if (res.ok) {
        const created: Community = await res.json();
        setCommunities(prev => [created, ...prev]);
        setSelectedCommunityId(created.id);
        setIsCreatingCommunity(false);
        setNewCommunityName('');
        setNewCommunityDesc('');
        setNewCommunityAvatar(null);
      } else { alert('Gagal membuat komunitas.'); }
    } catch {
      alert('Terjadi kesalahan.');
    }
  };

  if (!isForumOpen) return null;

  // Mobile view - Show communities or chat based on state
  const MobileCommunitiesView = () => (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">Komunitas</h3>
        <div className="flex items-center gap-2">
          {status === 'authenticated' && (
            <button onClick={() => setIsCreatingCommunity(true)} className="p-2 text-green-600 dark:text-lime-400 hover:text-green-500 dark:hover:text-lime-300">
              <FaPlus size={18} />
            </button>
          )}
          <button onClick={closeForum} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-lime-400">
            <FaTimes size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <button
          className={`w-full text-left p-4 flex items-center gap-3 transition-colors border-b border-gray-200 dark:border-gray-800/50 ${selectedCommunityId === 'all' ? 'bg-green-100 dark:bg-lime-400/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
          onClick={() => {
            setSelectedCommunityId('all');
            setIsMobileCommunitiesView(false);
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">A</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Semua Postingan</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lihat semua diskusi</p>
          </div>
        </button>
        
        {communities.map(c => (
          <button
            key={c.id}
            className={`w-full text-left p-4 flex items-center gap-3 transition-colors border-b border-gray-200 dark:border-gray-800/50 ${selectedCommunityId === c.id ? 'bg-green-100 dark:bg-lime-400/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
            onClick={() => {
              setSelectedCommunityId(c.id);
              setIsMobileCommunitiesView(false);
            }}
          >
            {c.avatarUrl ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-green-600 dark:text-lime-400 font-bold text-lg">
                {c.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
              {c.description && <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{c.description}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const MobileChatView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-white/10">
        <button 
          onClick={() => setIsMobileCommunitiesView(true)} 
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-lime-400 -ml-2"
        >
          <FaArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          {selectedCommunityId !== 'all' && (
            <>
              {communities.find(c => c.id === selectedCommunityId)?.avatarUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                  <Image 
                    src={communities.find(c => c.id === selectedCommunityId)?.avatarUrl || ''} 
                    alt="Community" 
                    fill 
                    className="object-cover" 
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-green-600 dark:text-lime-400 font-bold">
                  {(communities.find(c => c.id === selectedCommunityId)?.name?.charAt(0).toUpperCase()) || 'C'}
                </div>
              )}
            </>
          )}
          <div className="flex-1">
            <p className="font-display font-bold text-gray-900 dark:text-white text-lg">
              {selectedCommunityId === 'all' ? 'Semua Postingan' : communities.find(c => c.id === selectedCommunityId)?.name || 'Komunitas'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-600 dark:text-gray-400">Memuat postingan...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400">Belum ada postingan</p>
          </div>
        ) : (
          posts.map(post => renderMessage(post))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/50">
        {status === 'authenticated' ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea 
              value={newPostContent} 
              onChange={(e) => setNewPostContent(e.target.value)} 
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-500 dark:focus:border-lime-400 focus:ring-1 focus:ring-green-500/20 dark:focus:ring-lime-400/20" 
              rows={2} 
              placeholder="Tulis sesuatu..."
            />
            <div className="flex justify-between items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => setNewPostFile(e.target.files ? e.target.files[0] : null)} 
                className="text-xs text-gray-600 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-gray-200 dark:file:bg-gray-700 file:text-green-600 dark:file:text-lime-400 hover:file:bg-gray-300 dark:hover:file:bg-gray-600"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || (!newPostContent.trim() && !newPostFile)} 
                className="bg-green-600 dark:bg-lime-400 text-white dark:text-gray-900 p-2 rounded-full disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-600 dark:disabled:text-gray-400 transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane size={14} />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/login" className="font-semibold text-green-600 dark:text-lime-400 hover:underline">Login</Link> untuk berdiskusi.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" data-overlay="true">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeForum}></div>
        
        {/* Mobile Layout */}
        <div className="md:hidden relative z-10 w-full h-full">
          {isMobileCommunitiesView ? <MobileCommunitiesView /> : <MobileChatView />}
        </div>

        {/* Desktop Layout */}
        <aside className="hidden md:flex relative z-10 w-full max-w-4xl h-full glass-card rounded-l-2xl border-l border-gray-300 dark:border-white/10">
          {/* Kolom Kiri: Daftar Komunitas */}
          <div className="w-64 bg-gray-100 dark:bg-gray-900/50 h-full flex flex-col rounded-l-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Komunitas</h3>
              {status === 'authenticated' && (
                <button onClick={() => setIsCreatingCommunity(true)} className="inline-flex items-center gap-1 text-green-600 dark:text-lime-400 text-sm font-semibold hover:text-green-500 dark:hover:text-lime-300">
                  <FaPlus /> Baru
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${selectedCommunityId === 'all' ? 'bg-green-100 dark:bg-lime-400/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                onClick={() => setSelectedCommunityId('all')}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">A</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Semua Postingan</p>
                </div>
              </button>
              {communities.map(c => (
                <button
                  key={c.id}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${selectedCommunityId === c.id ? 'bg-green-100 dark:bg-lime-400/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedCommunityId(c.id)}
                >
                  {c.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700"><Image src={c.avatarUrl} alt={c.name} fill className="object-cover" /></div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-green-600 dark:text-lime-400 font-bold">{c.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">{c.name}</p>
                    {c.description && <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{c.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Percakapan */}
          <div className="flex-1 h-full flex flex-col bg-gray-50 dark:bg-gray-800/70">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <p className="font-display font-bold text-gray-900 dark:text-white text-lg">
                  {selectedCommunityId === 'all' ? 'Semua Postingan' : communities.find(c => c.id === selectedCommunityId)?.name || 'Komunitas'}
                </p>
              </div>
              <button onClick={closeForum} className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-lime-400"><FaTimes size={20} /></button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-400">Memuat postingan...</p>
              ) : posts.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-600 dark:text-gray-400">Belum ada postingan</p>
                </div>
              ) : (
                posts.map(post => renderMessage(post))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-white/10">
              {status === 'authenticated' ? (
                <form onSubmit={handleSubmit}>
                  <textarea 
                    value={newPostContent} 
                    onChange={(e) => setNewPostContent(e.target.value)} 
                    className="form-input" 
                    rows={2} 
                    placeholder="Tulis sesuatu..." 
                  />
                  <div className="flex justify-between items-center mt-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => setNewPostFile(e.target.files ? e.target.files[0] : null)} 
                      className="text-xs text-gray-600 dark:text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-gray-200 dark:file:bg-gray-700 file:text-green-600 dark:file:text-lime-400 hover:file:bg-gray-300 dark:hover:file:bg-gray-600"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting || (!newPostContent.trim() && !newPostFile)} 
                      className="btn-primary p-3 rounded-full"
                    >
                      {isSubmitting ? '...' : <FaPaperPlane />}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-center text-sm text-gray-400"><Link href="/login" className="font-semibold text-lime-400 hover:underline">Login</Link> untuk berdiskusi.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
      {modelViewerSrc && <ThreeDViewerModal src={modelViewerSrc} onClose={() => setModelViewerSrc(null)} />}
      {isCreatingCommunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setIsCreatingCommunity(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-white mb-4">Buat Komunitas Baru</h3>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <input value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} className="form-input" placeholder="Nama komunitas" />
              <textarea value={newCommunityDesc} onChange={(e) => setNewCommunityDesc(e.target.value)} className="form-input" rows={3} placeholder="Deskripsi (opsional)" />
              <div>
                <label className="text-sm font-semibold text-gray-300">Avatar (opsional)</label>
                <div className="flex items-center gap-4 p-3 mt-1 rounded-lg bg-gray-800 border border-gray-700">
                    <FaImage className="text-lime-400 text-xl flex-shrink-0" />
                    <input type="file" accept="image/*" onChange={(e) => setNewCommunityAvatar(e.target.files ? e.target.files[0] : null)} className="file-input" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setIsCreatingCommunity(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .glass-card { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 0.5rem; padding: 0.75rem 1rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { transform: scale(1.05); }
        .btn-primary:disabled { background-color: #4b5563; color: #9ca3af; cursor: not-allowed; }
        .btn-secondary { background-color: transparent; border: 1px solid #4b5563; color: #d1d5db; font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-secondary:hover { background-color: #374151; border-color: #6b7280; }
        .file-input::file-selector-button { background-color: #374151; border: none; color: #9EFF00; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; margin-right: 1rem; cursor: pointer; transition: background-color 0.2s; }
        .file-input::file-selector-button:hover { background-color: #4b5563; }
      `}</style>
    </>
  );
};

export default ForumSidebar;
