'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HoverModelViewer from '@/components/HoverModelViewer';
import { LIBRARY_CATEGORIES } from '@/constants/categories';
import { FaUpload, FaDownload, FaDollarSign, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

const ALL_CATEGORIES = ["Semua", ...LIBRARY_CATEGORIES];
const CATEGORY_DISPLAY_LIMIT = 7; // Batas jumlah kategori yang ditampilkan awalnya

// Komponen untuk Kartu Item di Perpustakaan
const LibraryItemCard = ({ item }: { item: GalleryItem }) => {
    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
            <div className="aspect-square">
                <HoverModelViewer src={item.fileUrl} alt={item.title} posterUrl={item.posterUrl || undefined} />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-display text-xl font-bold text-white mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">by {item.author.name || 'Anonim'}</p>
                <div className="mt-auto">
                    {item.isPaid ? (
                        <PaidDownloadButton itemId={item.id} price={item.price} />
                    ) : (
                        <a 
                          href={`/api/gallery/download?itemId=${item.id}`}
                          className="w-full text-center block bg-lime-400/80 text-lime-50 font-bold py-2 px-4 rounded-lg hover:bg-lime-400/100 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <FaDownload /> Unduh Gratis
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// Komponen untuk Tombol Unduh Berbayar
const PaidDownloadButton = ({ itemId, price }: { itemId: number; price: number }) => {
    // Logika untuk cek akses dan pembelian bisa ditambahkan di sini
    // Untuk saat ini, kita buat tombol statis
    return (
        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2">
            <FaDollarSign /> Beli Rp {new Intl.NumberFormat('id-ID').format(price)}
        </button>
    );
};

const PerpustakaanPage = () => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showAllCategories, setShowAllCategories] = useState(false); // State untuk show more/less

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const categoryQuery = selectedCategory === "Semua" ? "" : `?category=${selectedCategory}`;
      try {
        const res = await fetch(`/api/gallery${categoryQuery}`);
        if (res.ok) setItems(await res.json());
      } catch (error) {
        console.error("Gagal memuat item galeri:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory]);
  
  const displayedCategories = showAllCategories ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, CATEGORY_DISPLAY_LIMIT);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        {/* PERBAIKAN: Menambahkan padding horizontal (px-8) yang lebih lega */}
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-16 gap-y-12">
            
            {/* Kolom Kiri: Navigasi & Filter */}
            {/* PERBAIKAN: Menambahkan z-10 untuk memastikan kolom ini di atas kolom kanan */}
            <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit z-10">
              <div className="space-y-10">
                <div>
                    <h1 className="font-display text-3xl md:text-3xl font-bold text-white">Perpustakaan 3D</h1>
                    <p className="text-lg text-gray-400 mt-2">Jelajahi koleksi aset dari komunitas perekayasa.</p>
                </div>

                {status === 'authenticated' && (session?.user.role === 'DESAINER' || session?.user.role === 'ADMIN') && (
                    <Link href="/perpustakaan/upload" className="w-full flex items-center justify-center gap-2 bg-lime-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-lime-300 transition-transform duration-300 hover:scale-105">
                        <FaUpload /> Unggah Model Anda
                    </Link>
                )}

                <div>
                    <h3 className="font-display text-xl font-bold text-white mb-4">Kategori</h3>
                    <div className="space-y-2">
                        {displayedCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-semibold ${
                                    selectedCategory === cat 
                                    ? 'bg-lime-400/20 text-lime-300' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {ALL_CATEGORIES.length > CATEGORY_DISPLAY_LIMIT && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="text-lime-400/80 hover:text-lime-400 text-sm font-semibold mt-4 flex items-center gap-2"
                        >
                            {showAllCategories ? (
                                <> <FaChevronUp /> Tampilkan lebih sedikit </>
                            ) : (
                                <> <FaChevronDown /> Tampilkan lebih banyak </>
                            )}
                        </button>
                    )}
                </div>
              </div>
            </aside>

            {/* Kolom Kanan: Galeri */}
            <div className="lg:col-span-3">
              {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Skeleton Loader */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card rounded-2xl flex flex-col animate-pulse">
                            <div className="aspect-square bg-gray-700"></div>
                            <div className="p-4">
                                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {items.map(item => (
                    <LibraryItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl">
                    <h3 className="font-display text-2xl font-bold text-white">Tidak Ada Model</h3>
                    <p className="text-gray-400 mt-2">Belum ada model 3D dalam kategori ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
       <style jsx global>{`
            .glass-card {
                background: rgba(31, 41, 55, 0.4);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .font-display {
                font-family: 'Space Grotesk', sans-serif;
            }
            body {
                font-family: 'Inter', sans-serif;
            }
        `}</style>
    </div>
  );
};

export default PerpustakaanPage;
