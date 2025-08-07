'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Mulai proses loading

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      // Sekarang kita bisa dengan aman mem-parsing JSON untuk semua kasus
      const data = await res.json();

      if (res.ok) {
        // Jika sukses, redirect ke halaman login
        router.push('/login');
      } else {
        // Jika gagal, tampilkan pesan error dari API
        setError(data.message || 'Gagal mendaftar.');
      }
    } catch (err) {
      // Tangani error jaringan atau error tak terduga lainnya
      console.error(err);
      setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false); // Hentikan proses loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar Akun KitaRekayasa</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Nama</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting} // Tombol dinonaktifkan saat loading
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        <p className="text-center mt-4">
          Sudah punya akun? <Link href="/login" className="text-indigo-600 hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;