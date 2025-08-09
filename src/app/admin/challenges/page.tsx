'use client';
import { useEffect, useState } from 'react';

type Challenge = { id: number; title: string; category: string; status: string; reward: number };

export default function AdminChallengesPage() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Tantangan</h1>
      {loading ? <p>Memuat...</p> : (
        <table className="min-w-full border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Judul</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Reward</th>
            </tr>
          </thead>
          <tbody>
            {items.map(ch => (
              <tr key={ch.id} className="border-t">
                <td className="p-2">{ch.title}</td>
                <td className="p-2">{ch.category}</td>
                <td className="p-2">{ch.status}</td>
                <td className="p-2">Rp {new Intl.NumberFormat('id-ID').format(ch.reward as unknown as number)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


