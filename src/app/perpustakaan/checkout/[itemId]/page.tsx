'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Method = 'DANA' | 'OVO' | 'GoPay' | 'PayPal';

const CheckoutPage = () => {
  const params = useParams<{ itemId: string }>();
  const itemId = Number(params.itemId);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<{ id: number; title: string; price: number } | null>(null);
  const [method, setMethod] = useState<Method>('DANA');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!itemId || Number.isNaN(itemId)) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery?itemId=${itemId}`);
        // fallback: jika endpoint GET tidak dukung itemId, fetch semua lalu cari
        const list = await res.json();
        const found = Array.isArray(list) ? list.find((x: any) => x.id === itemId) : list;
        setItem(found ? { id: found.id, title: found.title, price: found.price } : null);
      } catch {
        setItem(null);
      } finally { setLoading(false); }
    };
    load();
  }, [itemId]);

  const priceLabel = useMemo(() => new Intl.NumberFormat('id-ID').format(item?.price || 0), [item]);

  const handlePay = async () => {
    if (!session) { router.push('/login'); return; }
    if (!item) return;
    setProcessing(true); setError('');
    try {
      // simulasi redirect ke gateway/payment QR, dsb
      await new Promise(r => setTimeout(r, 1200));
      // setelah "dibayar", catat purchase
      const res = await fetch('/api/gallery/purchase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Gagal mencatat pembayaran');
      router.push('/perpustakaan');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal membayar');
    } finally { setProcessing(false); }
  };

  if (status === 'loading' || loading) return <div className="p-6">Memuat...</div>;
  if (!item) return <div className="p-6">Item tidak ditemukan. <Link className="text-indigo-600" href="/perpustakaan">Kembali</Link></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-sm text-slate-600 mb-4">Item: <span className="font-semibold">{item.title}</span></p>
        <p className="text-lg font-bold mb-6">Total: Rp {priceLabel}</p>

        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Metode Pembayaran</p>
          <div className="grid grid-cols-2 gap-3">
            {(['DANA','OVO','GoPay','PayPal'] as Method[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`border rounded px-4 py-3 text-sm ${method === m ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200'}`}
              >{m}</button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button onClick={handlePay} disabled={processing} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded disabled:bg-indigo-300">
          {processing ? 'Memproses...' : `Bayar dengan ${method}`}
        </button>
        <p className="text-xs text-slate-500 mt-3">Simulasi pembayaran dummy.</p>
      </div>
    </div>
  );
};

export default CheckoutPage;


