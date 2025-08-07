'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModelViewer from '@/components/ModelViewer'; // Gunakan komponen yang sudah ada
import { FaUpload } from 'react-icons/fa';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  fileUrl: string;
  author: { name: string | null };
}

const KATEGORI = ["Semua", "Komponen Mesin", "Prototipe Produk", "Arsitektur", "Karakter", "Lainnya"];

const PerpustakaanPage = () => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const categoryQuery = selectedCategory === "Semua" ? "" : `?category=${selectedCategory}`;
      try {
        const res = await fetch(`/api/gallery${categoryQuery}`);
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (error) {
        console.error("Gagal memuat item galeri:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a2540]">Perpustakaan Digital 3D</h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Jelajahi, bagikan, dan gunakan koleksi model 3D dari para perekayasa di seluruh Indonesia.</p>
          </div>
          
          {status === 'authenticated' && (
            <div className="text-center mb-8">
              <Link href="/perpustakaan/upload" className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                <FaUpload className="inline mr-2" /> Unggah Model Anda
              </Link>
            </div>
          )}

          <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
            {KATEGORI.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`font-semibold py-2 px-5 rounded-full border-2 transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center">Memuat model...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <ModelViewer src={item.fileUrl} alt={item.title} />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">by {item.author.name || 'Anonim'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PerpustakaanPage;
