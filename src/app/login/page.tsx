'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        router.push('/tantangan'); // Redirect ke halaman tantangan setelah login
      } else {
        setError(res?.error || 'Email atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak diketahui');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-gray-200 transition-colors duration-300">
      <div className={`w-full max-w-md ${theme === 'light' ? 'bg-white shadow-xl border border-gray-200' : 'glass-card'} rounded-2xl p-8 shadow-2xl`}>
        <h1 className="font-display text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="text-center text-slate-600 dark:text-gray-400 mb-8">Login untuk melanjutkan petualangan rekayasa Anda.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg p-3 text-sm text-center">
              {error}
            </p>
          )}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${theme === 'light' ? 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-lime-400 focus:ring-lime-400/20'} border rounded-lg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2`}
              placeholder="Alamat Email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full ${theme === 'light' ? 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-lime-400 focus:ring-lime-400/20'} border rounded-lg px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2`}
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isSubmitting ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600 dark:text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className={`font-semibold ${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-lime-400 hover:text-lime-300'} hover:underline transition-colors`}>
            Daftar di sini
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .glass-card { 
          background: rgba(31, 41, 55, 0.4); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </div>
  );
};

export default LoginPage;
