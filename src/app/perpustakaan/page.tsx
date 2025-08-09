'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HoverModelViewer from '@/components/HoverModelViewer';
import { LIBRARY_CATEGORIES } from '@/constants/categories';
import { FaUpload, FaDownload } from 'react-icons/fa'; // 1. Import ikon Download

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  fileUrl: string;
  posterUrl?: string | null;
  isPaid: boolean;
  price: number;
  author: { name: string | null };
}

const KATEGORI = ["Semua", ...LIBRARY_CATEGORIES];

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
          
          {status === 'authenticated' && (session?.user.role === 'DESAINER' || session?.user.role === 'ADMIN') && (
            <div className="text-center mb-8">
              <Link href="/perpustakaan/upload" className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                <FaUpload className="inline mr-2" /> Unggah Model Anda
              </Link>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <select
              className="w-full max-w-xl border rounded-lg p-2 bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {KATEGORI.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-center">Memuat model...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <HoverModelViewer src={item.fileUrl} alt={item.title} posterUrl={item.posterUrl || undefined} />
                  {/* ======================================================= */}
                  {/* == PERBAIKAN UTAMA ADA DI SINI == */}
                  {/* ======================================================= */}
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${item.isPaid ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
                        {item.isPaid ? 'Berbayar' : 'Gratis'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">by {item.author.name || 'Anonim'}</p>
                    <div className="mt-auto">
                      {item.isPaid ? (
                        <PaidDownload itemId={item.id} price={item.price} />
                      ) : (
                        <a 
                          href={`/api/gallery/download?itemId=${item.id}`}
                          className="w-full text-center block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <FaDownload /> Unduh Gratis (.glb)
                        </a>
                      )}
                    </div>
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

const PaidDownload = ({ itemId, price }: { itemId: number; price: number }) => {
  const { data: session } = useSession();
  const [isBuying, setIsBuying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');

  const checkAccess = async () => {
    try {
      const res = await fetch(`/api/gallery/download?itemId=${itemId}`, { method: 'GET' });
      if (res.status === 403) { setHasAccess(false); return; }
      if (res.ok) { setHasAccess(true); return; }
    } catch {}
    setHasAccess(false);
  };

  useEffect(() => {
    checkAccess();
    // intentionally not including checkAccess in deps to avoid re-creation loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleBuy = async () => {
    if (!session) { window.location.href = '/login'; return; }
    setIsBuying(true); setError('');
    // Arahkan ke halaman checkout dummy
    window.location.href = `/perpustakaan/checkout/${itemId}`;
  };

  if (hasAccess) {
    return (
      <a
        href={`/api/gallery/download?itemId=${itemId}`}
        className="w-full text-center block bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <FaDownload /> Unduh (.glb)
      </a>
    );
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button onClick={handleBuy} disabled={isBuying} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
        {isBuying ? 'Memproses...' : `Beli Rp ${new Intl.NumberFormat('id-ID').format(price)}`}
      </button>
    </div>
  );
};

export default PerpustakaanPage;
