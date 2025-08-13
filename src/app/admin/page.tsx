'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';

type GItem = { id: number; title: string; isApproved: boolean; author: { name: string | null } };

function LibraryModeration() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [items, setItems] = useState<GItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/gallery?category=Semua');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const approve = async (id: number) => {
    const res = await fetch(`/api/gallery/approve/${id}`, { method: 'POST' });
    if (res.ok) setItems(prev => prev.map(x => x.id === id ? { ...x, isApproved: true } : x));
  };

  if (status === 'loading') return <p className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Memuat...</p>;
  if (!session || session.user.role !== 'ADMIN') return <p className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Hanya admin.</p>;

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
      <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Moderasi Perpustakaan</h1>
      {loading ? <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Memuat...</p> : (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className={`p-3 border rounded flex items-center justify-between ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{it.title}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>by {it.author?.name || 'Anonim'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${it.isApproved 
                  ? (theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') 
                  : (theme === 'dark' ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700')
                }`}>{it.isApproved ? 'Approved' : 'Pending'}</span>
                {!it.isApproved && (
                  <button onClick={() => approve(it.id)} className={`text-white text-sm px-3 py-1 rounded transition-colors ${
                    theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>Approve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryModeration;