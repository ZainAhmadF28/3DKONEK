'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LIBRARY_CATEGORIES } from '@/constants/categories';

const UploadLibraryPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState<number>(0);

  if (status === 'loading') return <p className="p-6">Memuat...</p>;
  if (!session) return <p className="p-6">Silakan <Link href="/login" className="text-indigo-600">login</Link> terlebih dahulu.</p>;
  if (session.user.role !== 'DESAINER' && session.user.role !== 'ADMIN') {
    return <p className="p-6">Hanya desainer yang dapat mengunggah model.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      formData.set('isPaid', String(isPaid));
      formData.set('price', String(isPaid ? price : 0));
      const res = await fetch('/api/gallery', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Gagal mengunggah.');
      router.push('/perpustakaan');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Unggah Model 3D</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Judul</label>
            <input name="title" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Kategori</label>
            <select name="category" className="w-full border rounded px-3 py-2" required>
              {LIBRARY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Deskripsi (opsional)</label>
            <textarea name="description" className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">File Model (.glb)</label>
            <input name="file" type="file" accept="model/gltf-binary" className="w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Poster (opsional)</label>
            <input name="poster" type="file" accept="image/*" className="w-full" />
          </div>
          <div className="border rounded p-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} /> Berbayar
            </label>
            {isPaid && (
              <div className="mt-2">
                <label className="block text-sm mb-1">Harga (Rp)</label>
                <input type="number" min={1000} step={500} value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} className="w-full border rounded px-3 py-2" />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded disabled:bg-indigo-300">
              {isSubmitting ? 'Mengunggah...' : 'Unggah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLibraryPage;
