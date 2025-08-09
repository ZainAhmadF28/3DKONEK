'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPaperPlane, FaUserCircle, FaFileAlt, FaCube, FaTimes, FaPlus } from 'react-icons/fa';
import ThreeDViewerModal from './ThreeDViewerModal';
import { useForum } from '@/context/ForumContext'; // Import hook context

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
  const { isForumOpen, closeForum } = useForum(); // Gunakan context
  const { data: session, status } = useSession();
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
        } catch (error) { console.error('Gagal memuat forum:', error); }
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
    if (newPostFile) {
      formData.append('file', newPostFile);
    }
    if (selectedCommunityId !== 'all') {
      formData.append('communityId', String(selectedCommunityId));
    }

    try {
      const res = await fetch('/api/forum', { method: 'POST', body: formData });
      if (res.ok) {
        const newPost = await res.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setNewPostFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert('Gagal mengirim postingan.');
      }
    } catch (error) {
      alert('Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttachment = (post: Post) => {
    if (!post.fileUrl || !post.fileType) return null;
    if (post.fileType.startsWith('image/')) {
      return <div className="relative mt-2 h-48 w-full rounded-lg overflow-hidden"><Image src={post.fileUrl} alt="Lampiran gambar" layout="fill" objectFit="cover" /></div>;
    }
    if (post.fileType === 'model/gltf-binary') {
      return <div className="mt-2 flex items-center gap-4"><button onClick={() => setModelViewerSrc(post.fileUrl)} className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline"><FaCube /> Lihat Model 3D</button><a href={post.fileUrl} download className="text-sm text-gray-500 hover:underline">Unduh</a></div>;
    }
    return <a href={post.fileUrl} download className="mt-2 inline-flex items-center gap-2 p-2 bg-slate-200 rounded-lg hover:bg-slate-300"><FaFileAlt /><span className="text-sm font-semibold">Unduh Lampiran</span></a>;
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
      } else {
        alert('Gagal membuat komunitas.');
      }
    } catch (error) {
      alert('Terjadi kesalahan.');
    }
  };

  if (!isForumOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeForum}></div>
        <aside className="relative z-10 w-full max-w-4xl bg-white h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 flex">
          {/* Left: community list */}
          <div className="w-64 border-r h-full flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-bold text-slate-800">Komunitas</h3>
              {status === 'authenticated' && (
                <button onClick={() => setIsCreatingCommunity(true)} className="inline-flex items-center gap-1 text-indigo-600 text-sm font-semibold">
                  <FaPlus /> Baru
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <button
                className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-3 ${selectedCommunityId === 'all' ? 'bg-slate-100' : ''}`}
                onClick={() => setSelectedCommunityId('all')}
              >
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold">A</div>
                <div>
                  <p className="font-semibold text-sm">Semua</p>
                  <p className="text-[11px] text-slate-500">Semua postingan</p>
                </div>
              </button>
              {communities.map(c => (
                <button
                  key={c.id}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-3 ${selectedCommunityId === c.id ? 'bg-slate-100' : ''}`}
                  onClick={() => setSelectedCommunityId(c.id)}
                >
                  {c.avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                      <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    {c.description && <p className="text-[11px] text-slate-500 truncate">{c.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: conversation */}
          <div className="flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <div>
                <p className="font-bold text-slate-800">
                  {selectedCommunityId === 'all' ? 'Semua' : communities.find(c => c.id === selectedCommunityId)?.name || 'Komunitas'}
                </p>
                {selectedCommunityId !== 'all' && (
                  <p className="text-[11px] text-slate-500">#{communities.find(c => c.id === selectedCommunityId)?.name}</p>
                )}
              </div>
              <button onClick={closeForum} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {isLoading ? <p>Memuat postingan...</p> : posts.map(post => (
                <div key={post.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <FaUserCircle size={28} className="text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-800">{post.author.name || 'Anonim'}</p>
                        <span className="text-[11px] text-gray-400">{new Date(post.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      {post.community && (
                        <p className="text-[11px] text-indigo-700 font-semibold">#{post.community.name}</p>
                      )}
                      <p className="mt-1 text-slate-700 whitespace-pre-wrap">{post.content}</p>
                      {renderAttachment(post)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t bg-white">
              {status === 'authenticated' ? (
                <form onSubmit={handleSubmit}>
                  <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="w-full p-2 border rounded-lg" rows={2} placeholder="Tulis sesuatu..." required/>
                  <div className="flex justify-between items-center mt-2">
                    <input type="file" ref={fileInputRef} onChange={(e) => setNewPostFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 inline-flex items-center gap-2">
                      {isSubmitting ? '...' : <FaPaperPlane />}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-center text-sm"><Link href="/login" className="text-indigo-600 font-semibold">Login</Link> untuk berdiskusi.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
      {modelViewerSrc && (
        <ThreeDViewerModal src={modelViewerSrc} onClose={() => setModelViewerSrc(null)} />
      )}
      {isCreatingCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setIsCreatingCommunity(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Buat Komunitas</h3>
            <form onSubmit={handleCreateCommunity} className="space-y-2">
              <input value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} className="w-full p-2 border rounded" placeholder="Nama komunitas" />
              <textarea value={newCommunityDesc} onChange={(e) => setNewCommunityDesc(e.target.value)} className="w-full p-2 border rounded" rows={3} placeholder="Deskripsi (opsional)" />
              <div>
                <label className="text-sm font-semibold">Avatar (opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => setNewCommunityAvatar(e.target.files ? e.target.files[0] : null)} className="block mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreatingCommunity(false)} className="px-3 py-2 rounded border">Batal</button>
                <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ForumSidebar;
