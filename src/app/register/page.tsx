'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CHALLENGE_CATEGORIES } from '@/constants/categories';

type RoleOption = 'UMUM' | 'DESAINER';

const tabs = ['PILIH ROLE', 'FORM DAFTAR', 'PILIH KATEGORI', 'LOGIN'] as const;

const RegisterPage = () => {
  const router = useRouter();
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // State global antar langkah
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flag penyelesaian tahap
  const [completedStep1, setCompletedStep1] = useState(false);
  const [completedStep2, setCompletedStep2] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Tahap 1 langsung otomatis saat pilih role, tak perlu tombol lanjut
  const canProceedStep2 = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      password === confirmPassword
    );
  }, [name, email, password, confirmPassword]);

  const handleSubmitAll = async () => {
    setError('');
    if (!selectedRole) {
      setError('Silakan pilih role terlebih dahulu.');
      setActiveTabIdx(0);
      return;
    }
    if (!canProceedStep2) {
      setError('Lengkapi form dan pastikan password valid.');
      setActiveTabIdx(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: selectedRole, categories: selectedCategories }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Gagal mendaftar');
      }
      setRegistrationSuccess(true);
      setActiveTabIdx(3);
      // Auto redirect ke login setelah 1.5s
      setTimeout(() => router.push('/login'), 1500);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Gagal mendaftar';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Pilih role untuk melanjutkan registrasi.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['UMUM', 'DESAINER'] as RoleOption[]).map((role) => (
          <button
            key={role}
            onClick={() => {
              setSelectedRole(role);
              setCompletedStep1(true);
              // otomatis lanjut ke form daftar
              setActiveTabIdx(1);
            }}
            className={`border rounded-lg p-6 text-left hover:shadow ${selectedRole === role ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200'}`}
          >
            <p className="text-lg font-bold">{role}</p>
            <p className="text-sm text-slate-600 mt-1">
              {role === 'UMUM' ? 'Pengguna umum yang ingin belajar dan berkolaborasi.' : 'Desainer 3D yang ingin berbagi karya dan menerima tantangan.'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={(e) => { e.preventDefault(); if (canProceedStep2) { setCompletedStep2(true); setActiveTabIdx(2); } }}>
      <div className="grid gap-4">
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Nama Lengkap</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Password (min 8)</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold text-slate-800 mb-1">Konfirmasi Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-600 mt-1">Password tidak cocok.</p>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" onClick={() => setActiveTabIdx(0)} className="px-4 py-2 rounded border">Kembali</button>
        <button type="submit" disabled={!canProceedStep2} className="px-5 py-2 rounded bg-indigo-600 text-white disabled:bg-indigo-300">Lanjut</button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <div>
      <p className="text-sm text-slate-600 mb-3">Pilih kategori minatmu (boleh lebih dari 1). Ini akan mempersonalisasi rekomendasi.</p>
      <div className="grid md:grid-cols-2 gap-3 max-h-80 overflow-auto p-2 border rounded">
        {CHALLENGE_CATEGORIES.map((cat) => {
          const checked = selectedCategories.includes(cat);
          return (
            <label key={cat} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCategories((prev) => Array.from(new Set([...prev, cat])));
                  else setSelectedCategories((prev) => prev.filter((c) => c !== cat));
                }}
              />
              {cat}
            </label>
          );
        })}
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={() => setActiveTabIdx(1)} className="px-4 py-2 rounded border">Kembali</button>
        <button onClick={handleSubmitAll} disabled={isSubmitting} className="px-5 py-2 rounded bg-indigo-600 text-white disabled:bg-indigo-300">
          {isSubmitting ? 'Menyimpan...' : 'Selesai & Daftar'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-2">
      <p className="font-semibold">Registrasi berhasil!</p>
      <p className="text-sm text-slate-600">Mengalihkan ke halaman login...</p>
      <p className="text-sm">Atau <Link href="/login" className="text-indigo-600 hover:underline">klik di sini</Link></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Daftar Akun</h1>
        <p className="text-center text-slate-600 mb-6">Lengkapi 4 langkah berikut.</p>

        {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4 text-sm">{error}</p>}

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {tabs.map((t, i) => {
            const enabled =
              i === 0 ||
              (i === 1 && completedStep1) ||
              (i === 2 && completedStep2) ||
              (i === 3 && registrationSuccess);
            return (
              <button
                key={t}
                onClick={() => enabled && setActiveTabIdx(i)}
                disabled={!enabled}
                className={`text-xs md:text-sm px-3 py-1 rounded-full border ${activeTabIdx === i ? 'bg-indigo-600 text-white border-indigo-600' : enabled ? 'bg-white text-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {`${i + 1}. ${t}`}
              </button>
            );
          })}
        </div>

        {activeTabIdx === 0 && renderStep1()}
        {activeTabIdx === 1 && renderStep2()}
        {activeTabIdx === 2 && renderStep3()}
        {activeTabIdx === 3 && renderStep4()}

        <p className="text-center mt-6 text-sm">
          Sudah punya akun? <Link href="/login" className="text-indigo-600 hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;