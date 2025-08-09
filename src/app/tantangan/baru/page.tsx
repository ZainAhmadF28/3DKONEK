'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaFileImage, FaEye } from 'react-icons/fa';
import { CHALLENGE_CATEGORIES } from '@/constants/categories';

// Komponen untuk Kartu Pratinjau Langsung
const LivePreviewCard = ({ formData, imageFiles }) => {
    const rewardFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(Number(formData.reward) || 0);

    const previewImage = imageFiles.length > 0 ? URL.createObjectURL(imageFiles[0]) : null;

    return (
        <div className="glass-card p-6 rounded-2xl border-t-2 border-lime-400 flex flex-col group">
            <div className="relative w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <FaEye className="text-gray-500 text-4xl" />
                )}
                 <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2 truncate group-hover:text-lime-400 transition-colors">
                {formData.title || 'Judul Tantangan Anda'}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-grow line-clamp-2">
                {formData.description || 'Deskripsi lengkap tantangan akan muncul di sini.'}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
                {formData.category && (
                    <span className="text-xs bg-gray-700 text-lime-400 font-semibold py-1 px-3 rounded-full">
                        {formData.category}
                    </span>
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-white/10 flex items-end justify-between">
                <div>
                    <p className="text-sm text-gray-400 mb-1">Imbalan</p>
                    <p className="text-xl font-bold text-white">{rewardFormatted}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-lime-400/20 text-lime-300 border-lime-400/30">
                    OPEN
                </span>
            </div>
        </div>
    );
};


const CreateChallengePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState({
    title: '',
    category: CHALLENGE_CATEGORIES[0],
    description: '',
    material: '',
    reward: '',
    deadline: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    for (const file of imageFiles) {
        data.append('imageFiles', file);
    }

    try {
      const res = await fetch('/api/challenges', { method: 'POST', body: data });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Gagal membuat tantangan.' }));
        throw new Error(errorData.message);
      }
      router.push('/tantangan');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Memuat...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-6">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="text-center mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Buat Tantangan Baru</h1>
                <p className="text-lg text-gray-400 mt-2">Bagikan masalah rekayasa Anda dan temukan solusinya.</p>
            </div>
            
            {/* Layout 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Kolom Kiri: Form Input */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-gray-300 font-semibold mb-2">Judul Tantangan</label>
                  <input type="text" name="title" id="title" value={formData.title} onChange={handleTextChange} className="form-input" required />
                </div>
                <div>
                  <label htmlFor="category" className="block text-gray-300 font-semibold mb-2">Kategori</label>
                  <select name="category" id="category" value={formData.category} onChange={handleTextChange} className="form-input">
                    {CHALLENGE_CATEGORIES.map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-gray-300 font-semibold mb-2">Deskripsi Lengkap</label>
                  <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleTextChange} className="form-input" required></textarea>
                </div>
                <div>
                  <label htmlFor="material" className="block text-gray-300 font-semibold mb-2">Material yang Diinginkan (Opsional)</label>
                  <input type="text" name="material" id="material" value={formData.material} onChange={handleTextChange} className="form-input" placeholder="Contoh: Baja S45C, Plastik ABS" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="reward" className="block text-gray-300 font-semibold mb-2">Imbalan (Rp)</label>
                      <input type="number" name="reward" id="reward" value={formData.reward} onChange={handleTextChange} className="form-input" placeholder="e.g. 2000000" required />
                    </div>
                    <div>
                      <label htmlFor="deadline" className="block text-gray-300 font-semibold mb-2">Batas Waktu</label>
                      <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleTextChange} className="form-input" required />
                    </div>
                </div>
              </div>

              {/* Kolom Kanan: Upload & Preview */}
              <div className="space-y-8">
                <div>
                  <label htmlFor="imageFiles" className="block text-gray-300 font-semibold mb-2">Gambar Referensi</label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
                    <div className="text-center">
                      <FaFileImage className="mx-auto h-12 w-12 text-gray-500" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-400">
                        <label htmlFor="imageFiles" className="relative cursor-pointer rounded-md font-semibold text-lime-400 focus-within:outline-none hover:text-lime-300">
                          <span>Unggah file</span>
                          <input id="imageFiles" name="imageFiles" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" required multiple />
                        </label>
                        <p className="pl-1">atau seret dan lepas</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-500">PNG, JPG hingga 10MB</p>
                    </div>
                  </div>
                  {imageFiles.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-300 mb-2">File yang dipilih:</h4>
                      <ul className="space-y-2">
                        {imageFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-400">{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Pratinjau Langsung</label>
                    <LivePreviewCard formData={formData} imageFiles={imageFiles} />
                </div>
              </div>
            </div>

            {/* Tombol Submit */}
            <div className="mt-12 border-t border-white/10 pt-8">
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full max-w-md mx-auto flex justify-center bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-300 disabled:bg-gray-500 transition-transform duration-300 hover:scale-105">
                    {isSubmitting ? 'Memproses...' : 'Publikasikan Tantangan'}
                </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
      {/* Menambahkan style untuk input form */}
      <style jsx>{`
        .form-input {
            width: 100%;
            background-color: #1f2937; /* bg-gray-800 */
            border: 1px solid #4b5563; /* border-gray-600 */
            color: white;
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #9EFF00; /* lime-400 */
            box-shadow: 0 0 0 2px #9EFF0040;
        }
      `}</style>
    </div>
  );
};

export default CreateChallengePage;
