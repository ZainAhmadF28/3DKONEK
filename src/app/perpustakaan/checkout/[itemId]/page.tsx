'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Method = 'DANA' | 'OVO' | 'GoPay' | 'PayPal';

const CheckoutPage = () => {
  const params = useParams<{ itemId: string }>();
  const itemId = Number(params.itemId);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<{ id: number; title: string; price: number } | null>(null);
  const [method, setMethod] = useState<Method>('DANA');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    if (!itemId || Number.isNaN(itemId)) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery?itemId=${itemId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch item');
        }
        const item = await res.json();
        
        if (item && item.id === itemId) {
          setItem({ id: item.id, title: item.title, price: item.price });
        } else {
          setItem(null);
        }
      } catch (error) {
        console.error('Error loading item:', error);
        setItem(null);
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, [itemId]);

  const priceLabel = useMemo(() => new Intl.NumberFormat('id-ID').format(item?.price || 0), [item]);

  const handlePay = async () => {
    console.log('handlePay function started');
    alert('handlePay function called');
    
    // Check session state first
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    if (status === 'loading') {
      console.log('Session still loading');
      setError('Session masih dimuat...');
      return;
    }
    
    if (!session) { 
      console.log('No session, redirecting to login');
      alert('No session found, redirecting to login');
      router.push('/login'); 
      return; 
    }
    
    if (!item) {
      console.log('No item found');
      setError('Item tidak ditemukan');
      alert('Item not found');
      return;
    }
    
    console.log('All checks passed, starting payment process for item:', item);
    setProcessing(true); 
    setError('');
    
    try {
      console.log('Simulating payment delay...');
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('Making API call to record purchase');
      const res = await fetch('/api/gallery/purchase', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      
      console.log('API response status:', res.status);
      const data = await res.json();
      console.log('API response data:', data);
      
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}: Gagal mencatat pembayaran`);
      }
      
      console.log('Payment successful, redirecting...');
      alert('Pembayaran berhasil! Anda akan diarahkan kembali ke perpustakaan.');
      // Redirect dengan parameter success untuk memicu refresh status pembelian
      router.push(`/perpustakaan?purchaseSuccess=${item.id}&t=${Date.now()}`);
    } catch (e: unknown) {
      console.error('Payment error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Gagal membayar';
      setError(errorMessage);
      alert('Payment failed: ' + errorMessage);
    } finally { 
      setProcessing(false); 
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      }`}>
        <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className={`p-8 rounded-xl ${
            theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-800 shadow-xl'
          }`}>
            <p className={`text-lg ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-200'
            }`}>Memuat...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      }`}>
        <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className={`p-8 rounded-xl ${
            theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-800 shadow-xl'
          }`}>
            <p className={`text-lg mb-4 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-200'
            }`}>Item tidak ditemukan.</p>
            <Link 
              className={`inline-block px-6 py-2 rounded-lg font-semibold transition-colors ${
                theme === 'light' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-lime-400 hover:bg-lime-300 text-gray-900'
              }`} 
              href="/perpustakaan"
            >
              Kembali
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-gray-900 text-gray-50'
    }`}>
      <Header />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className={`p-8 rounded-2xl shadow-xl ${
            theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-700'
          }`}>
            <div className="text-center mb-8">
              <h1 className={`font-display text-3xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Checkout</h1>
              <div className={`w-20 h-1 mx-auto rounded-full ${
                theme === 'light' ? 'bg-blue-600' : 'bg-lime-400'
              }`}></div>
            </div>

            {/* Item Info */}
            <div className={`p-6 rounded-xl mb-6 ${
              theme === 'light' ? 'bg-gray-50 border border-gray-200' : 'bg-gray-700/50 border border-gray-600'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>Item:</h2>
              <p className={`text-xl font-bold mb-3 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>{item.title}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>Total Pembayaran:</span>
                <span className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-blue-600' : 'text-lime-400'
                }`}>Rp {priceLabel}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['DANA','OVO','GoPay','PayPal'] as Method[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`p-4 rounded-xl font-semibold transition-all duration-200 ${
                      method === m
                        ? theme === 'light'
                          ? 'bg-blue-100 border-2 border-blue-600 text-blue-800 ring-2 ring-blue-200'
                          : 'bg-lime-900/50 border-2 border-lime-400 text-lime-300 ring-2 ring-lime-400/30'
                        : theme === 'light'
                        ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:border-lime-400 hover:bg-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-lg mb-6 ${
                theme === 'light' ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border border-red-700'
              }`}>
                <p className={`text-sm font-medium ${
                  theme === 'light' ? 'text-red-800' : 'text-red-400'
                }`}>{error}</p>
              </div>
            )}

            {/* Payment Button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log('Payment button clicked!');
                alert('Button clicked - payment system test');
                setButtonClicked(true);
                setTimeout(() => setButtonClicked(false), 200);
                handlePay();
              }} 
              disabled={processing} 
              type="button"
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                processing 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : buttonClicked
                  ? theme === 'light'
                    ? 'bg-blue-800 text-white scale-95'
                    : 'bg-lime-600 text-gray-900 scale-95'
                  : theme === 'light'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-lime-400 hover:bg-lime-300 text-gray-900 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {processing ? 'Memproses Pembayaran...' : `Bayar dengan ${method}`}
            </button>

            {/* Disclaimer */}
            <p className={`text-xs text-center mt-4 ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ⚠️ Simulasi pembayaran dummy untuk testing
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;


