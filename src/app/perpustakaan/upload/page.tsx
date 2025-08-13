'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaCube, FaImage, FaDollarSign } from 'react-icons/fa';
import { LIBRARY_CATEGORIES } from '@/constants/categories';
import { useTheme } from '@/context/ThemeContext';

// Komponen untuk Pratinjau Langsung
const ModelPreviewer = ({ posterFile, theme }: { posterFile: File | null, theme: string }) => {
    const previewImage = posterFile ? URL.createObjectURL(posterFile) : null;

    return (
        <div className={`${theme === 'light' ? 'bg-white border border-gray-200 shadow-lg' : 'glass-card'} p-4 rounded-2xl aspect-square flex flex-col`}>
            <div className={`relative w-full flex-grow ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900/50'} rounded-lg flex items-center justify-center overflow-hidden`}>
                {previewImage ? (
                    <img src={previewImage} alt="Pratinjau Poster" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-gray-500">
                        <FaCube className="mx-auto text-5xl" />
                        <p className="mt-2 text-sm">Pratinjau Model 3D</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const UploadLibraryPage = () => {
    const { data: session, status } = useSession();
    const { theme } = useTheme();
    const router = useRouter();
    
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(LIBRARY_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState<number>(0);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modelFile) {
            setError('File model .glb wajib diunggah.');
            return;
        }
        
        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('file', modelFile);
        if (posterFile) formData.append('poster', posterFile);
        formData.append('isPaid', String(isPaid));
        formData.append('price', String(isPaid ? price : 0));

        try {
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

    if (status === 'loading') {
        return <div className={`flex justify-center items-center min-h-screen ${theme === 'light' ? 'bg-gray-50 text-slate-900' : 'bg-gray-900 text-white'}`}>Memuat...</div>;
    }
    
    if (status === 'authenticated' && session.user.role !== 'DESAINER' && session.user.role !== 'ADMIN') {
        return <div className={`flex justify-center items-center min-h-screen ${theme === 'light' ? 'bg-gray-50 text-slate-900' : 'bg-gray-900 text-white'}`}>Hanya desainer yang dapat mengunggah model.</div>;
    }

    return (
        <div className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'} min-h-screen ${theme === 'light' ? 'text-gray-900' : 'text-gray-50'} flex flex-col`}>
            <Header />
            <main className="flex-grow pt-28 pb-20">
                <div className="container mx-auto px-6">
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-12">
                            <h1 className={`font-display text-4xl md:text-5xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Unggah Aset 3D</h1>
                            <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'} mt-2`}>Bagikan karya Anda ke perpustakaan komunitas.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Kolom Kiri: Form Input */}
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="title" className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Judul Aset</label>
                                    <input type="text" name="title" id="title" value={title} onChange={e => setTitle(e.target.value)} className={`w-full p-4 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`} required />
                                </div>
                                <div>
                                    <label htmlFor="category" className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Kategori</label>
                                    <select name="category" id="category" value={category} onChange={e => setCategory(e.target.value)} className={`w-full p-4 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`}>
                                        {LIBRARY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="description" className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Deskripsi (Opsional)</label>
                                    <textarea name="description" id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className={`w-full p-4 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all resize-none`}></textarea>
                                </div>
                                <div className={`${theme === 'light' ? 'bg-white border border-gray-200 shadow-lg' : 'glass-card'} p-6 rounded-2xl`}>
                                    <label className={`flex items-center gap-3 ${theme === 'light' ? 'text-slate-700' : 'text-gray-200'} cursor-pointer`}>
                                        <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className={`h-5 w-5 rounded ${theme === 'light' ? 'accent-blue-600 bg-white border-gray-300' : 'accent-lime-400 bg-gray-700 border-gray-600'}`} />
                                        <span className="font-semibold">Jadikan Aset Berbayar</span>
                                    </label>
                                    {isPaid && (
                                        <div className="mt-4">
                                            <label htmlFor="price" className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Harga (Rp)</label>
                                            <div className="relative">
                                                <FaDollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`} />
                                                <input type="number" id="price" min={1000} step={500} value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} className={`w-full p-4 pl-9 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kolom Kanan: Upload & Preview */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>File Model (.glb)</label>
                                        <div className={`flex items-center gap-4 p-4 rounded-lg ${theme === 'light' ? 'bg-gray-100 border border-gray-300' : 'bg-gray-800 border border-gray-700'}`}>
                                            <FaCube className={`${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} text-2xl flex-shrink-0`} />
                                            <input name="file" type="file" onChange={e => setModelFile(e.target.files ? e.target.files[0] : null)} accept="model/gltf-binary" className={`flex-1 text-sm ${theme === 'light' ? 'text-slate-700 file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200' : 'text-gray-200 file:bg-lime-100 file:text-gray-900 hover:file:bg-lime-200'} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold`} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Gambar Poster (Opsional)</label>
                                        <div className={`flex items-center gap-4 p-4 rounded-lg ${theme === 'light' ? 'bg-gray-100 border border-gray-300' : 'bg-gray-800 border border-gray-700'}`}>
                                            <FaImage className={`${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} text-2xl flex-shrink-0`} />
                                            <input name="poster" type="file" onChange={e => setPosterFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className={`flex-1 text-sm ${theme === 'light' ? 'text-slate-700 file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200' : 'text-gray-200 file:bg-lime-100 file:text-gray-900 hover:file:bg-lime-200'} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold`} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={`block ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} font-semibold mb-2`}>Pratinjau</label>
                                    <ModelPreviewer posterFile={posterFile} theme={theme} />
                                </div>
                            </div>
                        </div>

                        <div className={`mt-12 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} pt-8`}>
                            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                            <button type="submit" disabled={isSubmitting} className={`w-full max-w-md mx-auto flex justify-center ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 transition-transform duration-300 hover:scale-105`}>
                                {isSubmitting ? 'Mengunggah...' : 'Unggah ke Perpustakaan'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
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
                .file-input::file-selector-button {
                    background-color: #374151; /* bg-gray-700 */
                    border: none;
                    color: #9EFF00;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    margin-right: 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .file-input::file-selector-button:hover {
                    background-color: #4b5563; /* bg-gray-600 */
                }
            `}</style>
        </div>
    );
};

export default UploadLibraryPage;
