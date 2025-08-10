'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaPaperPlane, FaUserCircle, FaFileAlt, FaCube, FaTimes, FaPlus, FaImage } from 'react-icons/fa';
import ThreeDViewerModal from './ThreeDViewerModal';
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
  const { status } = useSession();
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

  useEffect(() => {
    if (isForumOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [postsRes, commsRes] = await Promise.all([
            fetch(`/api/forum${selectedCommunityId === 'all' ? '' : `?communityId=${selectedCommunityId}`}`),
            fetch('/api/forum/communities'),
          ]);
          if (postsRes.ok) setPosts(await postsRes.json());
          if (commsRes.ok) setCommunities(await commsRes.json());
        } catch {
          console.error('Gagal memuat forum');
        }
        finally { setIsLoading(false); }
      };
      fetchData();
    }
  }, [isForumOpen, selectedCommunityId]);

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
        setPosts(prev => [newPost, ...prev]);
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
      return <div className="relative mt-2 h-56 w-full rounded-lg overflow-hidden"><Image src={post.fileUrl} alt="Lampiran gambar" layout="fill" objectFit="cover" /></div>;
    }
    if (post.fileType === 'model/gltf-binary') {
      return <div className="mt-2 flex items-center gap-4"><button onClick={() => setModelViewerSrc(post.fileUrl)} className="inline-flex items-center gap-2 text-lime-400 font-semibold hover:underline"><FaCube /> Lihat Model 3D</button><a href={post.fileUrl} download className="text-sm text-gray-400 hover:underline">Unduh</a></div>;
    }
    return <a href={post.fileUrl} download className="mt-2 inline-flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"><FaFileAlt /><span className="text-sm font-semibold text-gray-200">Unduh Lampiran</span></a>;
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" data-overlay="true">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeForum}></div>
        <aside className="relative z-10 w-full max-w-4xl h-full flex glass-card rounded-l-2xl border-l border-white/10">
          {/* Kolom Kiri: Daftar Komunitas */}
          <div className="w-64 bg-gray-900/50 h-full flex flex-col rounded-l-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-display font-bold text-white">Komunitas</h3>
              {status === 'authenticated' && (
                <button onClick={() => setIsCreatingCommunity(true)} className="inline-flex items-center gap-1 text-lime-400 text-sm font-semibold hover:text-lime-300">
                  <FaPlus /> Baru
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${selectedCommunityId === 'all' ? 'bg-lime-400/20' : 'hover:bg-gray-700/50'}`}
                onClick={() => setSelectedCommunityId('all')}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">A</div>
                <div>
                  <p className="font-semibold text-sm text-white">Semua Postingan</p>
                </div>
              </button>
              {communities.map(c => (
                <button
                  key={c.id}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${selectedCommunityId === c.id ? 'bg-lime-400/20' : 'hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedCommunityId(c.id)}
                >
                  {c.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700"><Image src={c.avatarUrl} alt={c.name} fill className="object-cover" /></div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lime-400 font-bold">{c.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-white">{c.name}</p>
                    {c.description && <p className="text-xs text-gray-400 truncate">{c.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Percakapan */}
          <div className="flex-1 h-full flex flex-col bg-gray-800/70">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <p className="font-display font-bold text-white text-lg">
                  {selectedCommunityId === 'all' ? 'Semua Postingan' : communities.find(c => c.id === selectedCommunityId)?.name || 'Komunitas'}
                </p>
              </div>
              <button onClick={closeForum} className="text-gray-400 hover:text-lime-400"><FaTimes size={20} /></button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {isLoading ? <p className="text-center text-gray-400">Memuat postingan...</p> : posts.map(post => (
                <div key={post.id} className="p-3 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaUserCircle size={32} className="text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white">{post.author.name || 'Anonim'}</p>
                        <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {post.community && selectedCommunityId === 'all' && (
                        <p className="text-xs text-lime-400 font-semibold">#{post.community.name}</p>
                      )}
                      <p className="mt-1 text-gray-200 whitespace-pre-wrap">{post.content}</p>
                      {renderAttachment(post)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              {status === 'authenticated' ? (
                <form onSubmit={handleSubmit}>
                  <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="form-input" rows={2} placeholder="Tulis sesuatu..." required/>
                  <div className="flex justify-between items-center mt-2">
                    <input type="file" ref={fileInputRef} onChange={(e) => setNewPostFile(e.target.files ? e.target.files[0] : null)} className="file-input"/>
                    <button type="submit" disabled={isSubmitting} className="btn-primary p-3 rounded-full">
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
