'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const UploadGalleryPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Komponen Mesin');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPoster(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !file) {
        if (!file) setError('File model .glb wajib diunggah.');
        return;
    }
    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    data.append('title', title);
    data.append('category', category);
    data.append('description', description);
    data.append('file', file);
    if (poster) data.append('poster', poster);

    try {
      const res = await fetch('/api/gallery', { method: 'POST', body: data });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal mengunggah model.');
      }
      router.push('/perpustakaan');
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link href="/perpustakaan" className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-4 hover:underline">
            <FaArrowLeft /> Kembali ke Perpustakaan
          </Link>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Unggah Model 3D</h1>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-semibold">Judul Model</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-semibold">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg bg-white">
                  <option>Komponen Mesin</option>
                  <option>Prototipe Produk</option>
                  <option>Arsitektur</option>
                  <option>Karakter</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="file" className="block text-gray-700 font-semibold">File Model (.glb)</label>
                <input type="file" onChange={handleFileChange} className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept=".glb" required />
              </div>
              <div className="mb-4">
                <label htmlFor="poster" className="block text-gray-700 font-semibold">Poster (gambar pratinjau, opsional)</label>
                <input type="file" onChange={handlePosterChange} className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-semibold">Deskripsi (Opsional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 border rounded-lg"></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Mengunggah...' : 'Unggah ke Perpustakaan'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadGalleryPage;
