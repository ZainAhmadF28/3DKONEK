'use client';

import { useState, useEffect } from 'react';
// ... (imports lainnya tetap sama)
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaFileImage } from 'react-icons/fa';
import { CHALLENGE_CATEGORIES } from '@/constants/categories';

const CreateChallengePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState({
    title: '',
    category: CHALLENGE_CATEGORIES[0],
    description: '',
    material: '', // State baru untuk material
    reward: '',
    deadline: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // ... (state error dan submitting tetap sama)
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (useEffect dan handleTextChange tetap sama)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || imageFiles.length === 0) {
        if (imageFiles.length === 0) setError('Minimal satu gambar wajib diunggah.');
        return;
    }

    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('material', formData.material); // Tambahkan material ke FormData
    data.append('reward', formData.reward);
    data.append('deadline', formData.deadline);
    for (const file of imageFiles) {
        data.append('imageFiles', file);
    }

    // ... (logika fetch tetap sama)
    try {
      const res = await fetch('/api/challenges', { method: 'POST', body: data });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Gagal membuat tantangan.' }));
        throw new Error(errorData.message);
      }
      router.push('/tantangan');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
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
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-center">Buat Tantangan Baru</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error}</p>}
              
              {/* ... input title dan category tetap sama ... */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-semibold">Judul Tantangan</label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-semibold">Kategori</label>
                <select name="category" id="category" value={formData.category} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg bg-white">
                  {CHALLENGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Input Material Baru */}
              <div className="mb-4">
                <label htmlFor="material" className="block text-gray-700 font-semibold">Material yang Diinginkan (Opsional)</label>
                <input type="text" name="material" id="material" value={formData.material} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="Contoh: Baja S45C, ABS Plastik, dll." />
              </div>

              {/* ... sisa form tetap sama ... */}
              <div className="mb-4">
                <label htmlFor="imageFiles" className="block text-gray-700 font-semibold">Gambar Tantangan</label>
                <p className="text-sm text-gray-500">Unggah satu atau lebih file gambar (JPG/PNG).</p>
                <input type="file" name="imageFiles" id="imageFiles" onChange={handleFileChange} className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/png, image/jpeg" required multiple />
              </div>
              {imageFiles.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-sm text-slate-600 mb-2">File yang dipilih:</h4>
                  <ul className="space-y-2">
                    {imageFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm text-slate-800">
                        <div className="flex items-center gap-2"><FaFileImage className="text-indigo-500"/><span>{file.name}</span></div>
                        <span className="text-slate-500">{(file.size / 1024).toFixed(2)} KB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-semibold">Deskripsi Lengkap</label>
                <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="reward" className="block text-gray-700 font-semibold">Imbalan (Rp)</label>
                  <input type="number" name="reward" id="reward" value={formData.reward} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="e.g. 2000000" required />
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-gray-700 font-semibold">Batas Waktu</label>
                  <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleTextChange} className="w-full mt-1 px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Memproses...' : 'Publikasikan Tantangan'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateChallengePage;
