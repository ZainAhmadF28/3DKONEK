'use client';
import { useEffect, useState } from 'react';

type Community = { id: number; name: string; description: string | null };

export default function AdminCommunitiesPage() {
  const [items, setItems] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/forum/communities');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Komunitas</h1>
      {loading ? <p>Memuat...</p> : (
        <table className="min-w-full border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


