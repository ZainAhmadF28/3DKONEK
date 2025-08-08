'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPaperPlane, FaUserCircle, FaFileAlt, FaCube, FaDownload, FaTimes } from 'react-icons/fa';
import ThreeDViewerModal from './ThreeDViewerModal';
import { useForum } from '@/context/ForumContext'; // Import hook context

interface Post {
  id: number;
  content: string;
  fileUrl: string | null;
  fileType: string | null;
  createdAt: string;
  author: { name: string | null };
}

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

  useEffect(() => {
    if (isForumOpen) {
      const fetchPosts = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/forum');
          if (res.ok) setPosts(await res.json());
        } catch (error) { console.error("Gagal memuat post:", error); } 
        finally { setIsLoading(false); }
      };
      fetchPosts();
    }
  }, [isForumOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostFile) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostFile) {
      formData.append('file', newPostFile);
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

  if (!isForumOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeForum}></div>
        
        {/* Sidebar Content */}
        <aside className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">Forum Diskusi</h2>
            <button onClick={closeForum} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {isLoading ? <p>Memuat postingan...</p> : posts.map(post => (
              <div key={post.id} className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaUserCircle size={28} className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">{post.author.name || 'Anonim'}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('id-ID')}</p>
                    <p className="mt-2 text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    {renderAttachment(post)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t bg-slate-50">
            {status === 'authenticated' ? (
              <form onSubmit={handleSubmit}>
                <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="w-full p-2 border rounded-lg" rows={2} placeholder="Tulis sesuatu..." required/>
                <div className="flex justify-between items-center mt-2">
                  <input type="file" ref={fileInputRef} onChange={(e) => setNewPostFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                  <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2">
                    {isSubmitting ? '...' : <FaPaperPlane />}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-center text-sm"><Link href="/login" className="text-indigo-600 font-semibold">Login</Link> untuk berdiskusi.</p>
            )}
          </div>
        </aside>
      </div>
      {modelViewerSrc && (
        <ThreeDViewerModal src={modelViewerSrc} onClose={() => setModelViewerSrc(null)} />
      )}
    </>
  );
};

export default ForumSidebar;
