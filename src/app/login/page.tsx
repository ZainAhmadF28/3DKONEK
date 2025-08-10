'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl">
        <h1 className="font-display text-3xl font-bold text-center text-white mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="text-center text-gray-400 mb-8">Login untuk melanjutkan petualangan rekayasa Anda.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg p-3 text-sm text-center">
              {error}
            </p>
          )}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Alamat Email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary"
          >
            {isSubmitting ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-lime-400 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>

      <style jsx>{`
        .glass-card { background: rgba(31, 41, 55, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        body { font-family: 'Inter', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 0.5rem; padding: 0.75rem 1rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { transform: scale(1.05); }
        .btn-primary:disabled { background-color: #4b5563; color: #9ca3af; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default LoginPage;
