'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const CreateChallengePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Gear & Transmisi',
    imageUrl: '',
    description: '',
    reward: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect jika tidak login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Gagal membuat tantangan. Pastikan semua data terisi.');
      }
      
      router.push('/tantangan'); // Kembali ke halaman utama tantangan
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Buat Tantangan Baru</h1>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-semibold">Judul Tantangan</label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-semibold">Kategori</label>
                <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg bg-white">
                  <option>Gear & Transmisi</option>
                  <option>Komponen Mesin</option>
                  <option>Moulding & Cetakan</option>
                  <option>Prototipe Produk</option>
                  <option>Elektronika</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-gray-700 font-semibold">URL Gambar</label>
                <p className="text-sm text-gray-500">Untuk saat ini, silakan masukkan link URL gambar secara langsung.</p>
                <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-semibold">Deskripsi Lengkap</label>
                <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="reward" className="block text-gray-700 font-semibold">Imbalan (Rp)</label>
                  <input type="number" name="reward" id="reward" value={formData.reward} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="e.g. 2000000" required />
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-gray-700 font-semibold">Batas Waktu</label>
                  <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Memproses...' : 'Publikasikan Tantangan'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateChallengePage;