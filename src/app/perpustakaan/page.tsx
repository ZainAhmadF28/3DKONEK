'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HoverModelViewer from '@/components/HoverModelViewer';
import { LIBRARY_CATEGORIES } from '@/constants/categories';
import { FaUpload, FaDownload, FaDollarSign, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

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
const LibraryItemCard = ({ item, purchaseRefreshKey }: { item: GalleryItem; purchaseRefreshKey?: number }) => {
    const { theme } = useTheme();
    
    return (
        <div className={`${theme === 'light' ? 'bg-white shadow-lg border border-gray-200' : 'glass-card'} rounded-2xl overflow-hidden flex flex-col group`}>
            <div className="aspect-square">
                <HoverModelViewer src={item.fileUrl} alt={item.title} posterUrl={item.posterUrl || undefined} />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">by {item.author.name || 'Anonim'}</p>
                <div className="mt-auto">
                    {item.isPaid ? (
                        <PaidDownloadButton itemId={item.id} price={item.price} refreshKey={purchaseRefreshKey} />
                    ) : (
                        <a 
                          href={`/api/gallery/download?itemId=${item.id}`}
                          className={`w-full text-center block ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400/80 hover:bg-lime-400/100 text-lime-50'} font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2`}
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
const PaidDownloadButton = ({ itemId, price, refreshKey }: { itemId: number; price: number; refreshKey?: number }) => {
    const { theme } = useTheme();
    const { data: session } = useSession();
    const [isPurchased, setIsPurchased] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPurchaseStatus = async () => {
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/gallery/purchased?itemId=${itemId}`);
                if (res.ok) {
                    const data = await res.json();
                    setIsPurchased(data.purchased);
                }
            } catch (error) {
                console.error('Error checking purchase status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkPurchaseStatus();
    }, [itemId, session, refreshKey]); // Tambahkan refreshKey sebagai dependency

    if (isLoading) {
        return (
            <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} text-gray-500 font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2`}>
                Mengecek...
            </div>
        );
    }

    if (isPurchased) {
        return (
            <a 
                href={`/api/gallery/download?itemId=${itemId}`}
                className={`w-full text-center block ${theme === 'light' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-400 text-white'} font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2`}
            >
                <FaDownload /> Unduh
            </a>
        );
    }

    return (
        <Link 
            href={`/perpustakaan/checkout/${itemId}`}
            className={`w-full ${theme === 'light' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-500 hover:bg-amber-600'} text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors`}
        >
            <FaDollarSign /> Beli Rp {new Intl.NumberFormat('id-ID').format(price)}
        </Link>
    );
};

const PerpustakaanPage = () => {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [purchaseRefreshKey, setPurchaseRefreshKey] = useState(0); // Key untuk trigger refresh pembelian

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

  // Effect untuk menangani success purchase redirect
  useEffect(() => {
    const purchaseSuccess = searchParams.get('purchaseSuccess');
    if (purchaseSuccess) {
      console.log('Purchase successful for item:', purchaseSuccess);
      // Trigger refresh untuk komponen PaidDownloadButton
      setPurchaseRefreshKey(prev => prev + 1);
      
      // Hapus parameter dari URL tanpa reload
      const url = new URL(window.location.href);
      url.searchParams.delete('purchaseSuccess');
      url.searchParams.delete('t');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);
  
  const displayedCategories = showAllCategories ? ALL_CATEGORIES : ALL_CATEGORIES.slice(0, CATEGORY_DISPLAY_LIMIT);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen text-slate-900 dark:text-gray-50 flex flex-col transition-colors duration-300">
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
                    <h1 className="font-display text-3xl md:text-3xl font-bold text-slate-900 dark:text-white">Perpustakaan 3D</h1>
                    <p className="text-lg text-slate-600 dark:text-gray-400 mt-2">Jelajahi koleksi aset dari komunitas perekayasa.</p>
                </div>

                {status === 'authenticated' && (session?.user.role === 'DESAINER' || session?.user.role === 'ADMIN') && (
                    <Link href="/perpustakaan/upload" className={`w-full flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105`}>
                        <FaUpload /> Unggah Model Anda
                    </Link>
                )}

                <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">Kategori</h3>
                    <div className="space-y-2">
                        {displayedCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left p-3 rounded-lg transition-colors text-sm font-semibold ${
                                    selectedCategory === cat 
                                    ? theme === 'light'
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-lime-400/20 text-lime-300' 
                                    : theme === 'light'
                                      ? 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
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
                            className={`${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-lime-400/80 hover:text-lime-400'} text-sm font-semibold mt-4 flex items-center gap-2 transition-colors`}
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
                        <div key={i} className={`${theme === 'dark' ? 'glass-card' : 'bg-white border border-gray-200'} rounded-2xl flex flex-col animate-pulse`}>
                            <div className={`aspect-square ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <div className="p-4">
                                <div className={`h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-2`}></div>
                                <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
                            </div>
                        </div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {items.map(item => (
                    <LibraryItemCard key={item.id} item={item} purchaseRefreshKey={purchaseRefreshKey} />
                  ))}
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className={`text-center py-16 ${theme === 'dark' ? 'glass-card' : 'bg-white border border-gray-200'} rounded-2xl`}>
                    <h3 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tidak Ada Model</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Belum ada model 3D dalam kategori ini.</p>
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
            [data-theme="light"] .glass-card {
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0, 0, 0, 0.1);
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
