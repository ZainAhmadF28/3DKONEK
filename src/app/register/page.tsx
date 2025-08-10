'use client';

import { useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CHALLENGE_CATEGORIES } from '@/constants/categories';
import { FaUser, FaPaintBrush, FaList, FaCheckCircle } from 'react-icons/fa';

type RoleOption = 'UMUM' | 'DESAINER';

const RegisterPage = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // State global
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceedToStep2 = useMemo(() => {
    return name.trim().length > 0 && email.includes('@') && password.length >= 8 && password === confirmPassword;
  }, [name, email, password, confirmPassword]);

  const handleSubmitAll = async () => {
    if (!selectedRole) { setError('Pilih role Anda.'); setActiveStep(0); return; }
    if (!canProceedToStep2) { setError('Lengkapi data diri dan pastikan password valid.'); setActiveStep(1); return; }
    
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: selectedRole, categories: selectedCategories }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Gagal mendaftar');
      setActiveStep(3); // Pindah ke halaman sukses
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { name: 'Pilih Role', icon: <FaUser /> },
    { name: 'Isi Data', icon: <FaPaintBrush /> },
    { name: 'Pilih Minat', icon: <FaList /> },
    { name: 'Selesai', icon: <FaCheckCircle /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-3xl glass-card rounded-2xl p-8 shadow-2xl">
        <h1 className="font-display text-3xl font-bold text-center text-white">Buat Akun Baru</h1>
        <p className="text-center text-gray-400 mb-8">Bergabunglah dengan komunitas perekayasa Indonesia.</p>

        {/* Stepper Grafis */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <Fragment key={step.name}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${activeStep >= index ? 'bg-lime-400 border-lime-400 text-gray-900' : 'border-gray-600 text-gray-500'}`}>
                  {step.icon}
                </div>
                <p className={`text-xs mt-2 transition-colors ${activeStep >= index ? 'text-lime-400' : 'text-gray-500'}`}>{step.name}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${activeStep > index ? 'border-lime-400' : 'border-gray-600'}`}></div>
              )}
            </Fragment>
          ))}
        </div>
        
        {error && <p className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg p-3 mb-6 text-sm text-center">{error}</p>}

        {/* Konten Step */}
        <div className="min-h-[300px]">
          {activeStep === 0 && ( // Step 1: Pilih Role
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-gray-400">Pilih peran yang paling sesuai dengan Anda.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['UMUM', 'DESAINER'] as RoleOption[]).map((role) => (
                  <button key={role} onClick={() => { setSelectedRole(role); setActiveStep(1); }}
                    className={`glass-card p-6 text-left rounded-xl border-2 transition-all duration-300 ${selectedRole === role ? 'border-lime-400 ring-2 ring-lime-400/20' : 'border-transparent hover:border-gray-600'}`}>
                    <h3 className="font-display text-lg font-bold text-white">{role}</h3>
                    <p className="text-sm text-gray-400 mt-1">{role === 'UMUM' ? 'Belajar, berkolaborasi, dan melihat karya.' : 'Berbagi karya dan menerima tantangan.'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeStep === 1 && ( // Step 2: Form Daftar
             <form onSubmit={(e) => { e.preventDefault(); if (canProceedToStep2) setActiveStep(2); }} className="space-y-4 animate-fade-in">
                <input className="form-input" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" className="form-input" placeholder="Alamat Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" className="form-input" placeholder="Password (minimal 8 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" className="form-input" placeholder="Konfirmasi Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {password && confirmPassword && password !== confirmPassword && <p className="text-xs text-red-400">Password tidak cocok.</p>}
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={() => setActiveStep(0)} className="btn-secondary">Kembali</button>
                    <button type="submit" disabled={!canProceedToStep2} className="btn-primary">Lanjut</button>
                </div>
             </form>
          )}

          {activeStep === 2 && ( // Step 3: Pilih Kategori
            <div className="animate-fade-in">
                <p className="text-center text-gray-400 mb-4">Pilih kategori minat untuk personalisasi konten.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 rounded-lg bg-gray-800/50">
                    {CHALLENGE_CATEGORIES.map((cat) => {
                        const isChecked = selectedCategories.includes(cat);
                        return (
                            <label key={cat} className={`p-3 rounded-lg text-sm text-center cursor-pointer transition-all duration-200 ${isChecked ? 'bg-lime-400 text-gray-900 font-bold' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                                <input type="checkbox" className="sr-only" checked={isChecked} onChange={(e) => {
                                    if (e.target.checked) setSelectedCategories(prev => [...prev, cat]);
                                    else setSelectedCategories(prev => prev.filter(c => c !== cat));
                                }} />
                                {cat}
                            </label>
                        );
                    })}
                </div>
                <div className="flex justify-between pt-6">
                    <button onClick={() => setActiveStep(1)} className="btn-secondary">Kembali</button>
                    <button onClick={handleSubmitAll} disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? 'Mendaftar...' : 'Selesai & Daftar'}
                    </button>
                </div>
            </div>
          )}

          {activeStep === 3 && ( // Step 4: Sukses
            <div className="text-center animate-fade-in py-10">
                <FaCheckCircle className="mx-auto text-5xl text-lime-400 mb-4" />
                <h2 className="font-display text-2xl font-bold text-white">Registrasi Berhasil!</h2>
                <p className="text-gray-400">Anda akan dialihkan ke halaman login...</p>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Sudah punya akun? <Link href="/login" className="font-semibold text-lime-400 hover:underline">Login di sini</Link>
        </p>
      </div>

      <style jsx>{`
        .glass-card { background: rgba(31, 41, 55, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        body { font-family: 'Inter', sans-serif; }
        .form-input { width: 100%; background-color: #1f2937; border: 1px solid #4b5563; color: white; border-radius: 0.5rem; padding: 0.75rem 1rem; transition: all 0.2s; }
        .form-input::placeholder { color: #6b7280; }
        .form-input:focus { outline: none; border-color: #9EFF00; box-shadow: 0 0 0 2px #9EFF0040; }
        .btn-primary { background-color: #9EFF00; color: #111827; font-weight: 700; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-primary:hover { transform: scale(1.05); }
        .btn-primary:disabled { background-color: #4b5563; color: #9ca3af; cursor: not-allowed; }
        .btn-secondary { background-color: transparent; border: 1px solid #4b5563; color: #d1d5db; font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
        .btn-secondary:hover { background-color: #374151; border-color: #6b7280; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
