'use client';
import { useEffect, useState } from 'react';

type Post = { id: number; content: string; createdAt: string; author: { name: string | null } };

export default function AdminForumPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/forum');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Forum</h1>
      {loading ? <p>Memuat...</p> : (
        <ul className="space-y-3">
          {items.map(p => (
            <li key={p.id} className="p-3 border rounded">
              <p className="text-sm text-slate-500">{new Date(p.createdAt).toLocaleString('id-ID')}</p>
              <p className="font-semibold">{p.author?.name || 'Anonim'}</p>
              <p className="text-slate-700 whitespace-pre-wrap">{p.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


