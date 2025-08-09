'use client';
import { useEffect, useState } from 'react';

type Item = {
  id: number; title: string; category: string; isPaid: boolean; price: number; isApproved: boolean;
  author: { name: string | null };
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery?category=Semua');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    const res = await fetch(`/api/gallery/approve/${id}`, { method: 'POST' });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Perpustakaan</h1>
      {loading ? <p>Memuat...</p> : (
        <table className="min-w-full border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Judul</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Harga</th>
              <th className="p-2 text-left">Author</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.title}</td>
                <td className="p-2">{it.category}</td>
                <td className="p-2">{it.isApproved ? 'Approved' : 'Pending'}</td>
                <td className="p-2">{it.isPaid ? `Rp ${new Intl.NumberFormat('id-ID').format(it.price)}` : 'Gratis'}</td>
                <td className="p-2">{it.author?.name || 'Anonim'}</td>
                <td className="p-2 text-right">
                  {!it.isApproved && (
                    <button onClick={() => approve(it.id)} className="bg-indigo-600 text-white text-sm px-3 py-1 rounded">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


