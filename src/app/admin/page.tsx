'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type GItem = { id: number; title: string; isApproved: boolean; author: { name: string | null } };

function LibraryModeration() {
  const { data: session, status } = useSession();
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

  if (status === 'loading') return <p className="p-6">Memuat...</p>;
  if (!session || session.user.role !== 'ADMIN') return <p className="p-6">Hanya admin.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Moderasi Perpustakaan</h1>
      {loading ? <p>Memuat...</p> : (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <p className="font-semibold">{it.title}</p>
                <p className="text-xs text-slate-500">by {it.author?.name || 'Anonim'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${it.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{it.isApproved ? 'Approved' : 'Pending'}</span>
                {!it.isApproved && (
                  <button onClick={() => approve(it.id)} className="bg-indigo-600 text-white text-sm px-3 py-1 rounded">Approve</button>
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