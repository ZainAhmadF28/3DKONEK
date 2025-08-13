'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { FaFilePdf, FaCheck, FaComments, FaCube, FaDownload, FaUser, FaBook, FaPlus } from 'react-icons/fa';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import BengkelDetailModal from '@/components/BengkelDetailModal';
import ProposalStatusBadge from '@/components/ProposalStatusBadge';
import ThreeDViewerModal from '@/components/ThreeDViewerModal';
import { useTheme } from '@/context/ThemeContext';

// Tipe data spesifik untuk halaman ini
interface MyProposal { id: number; status: string; challenge: Challenge; }
interface MyChallenge extends Challenge {
    proposals: { id: number; message: string; fileUrl: string | null; author: { name: string | null; } }[];
    submissions: { id: number; fileUrl: string; notes: string | null; status: string; author: { name: string | null; } }[];
    solver: { id: number; name: string | null; } | null;
}
interface MyLibraryItem { id: number; title: string; isPaid: boolean; price: number; isApproved: boolean; posterUrl?: string | null; }

// Komponen Panel Profil
const ProfilePanel = () => {
    const { data: session } = useSession();
    const { theme } = useTheme();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState(session?.user?.name || '');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => { setEmail(session?.user?.email || ''); setName(session?.user?.name || ''); }, [session]);

    const canSave = useMemo(() => {
        if (!email.trim()) return false;
        if (newPassword && newPassword.length < 8) return false;
        return true;
    }, [email, newPassword]);

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/akun/profile', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Gagal menyimpan');
            alert('Profil diperbarui. Silakan login ulang jika Anda mengganti email/password.');
            setCurrentPassword(''); setNewPassword('');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Gagal menyimpan');
        } finally { setSaving(false); }
    };

    return (
        <div className={`${theme === 'light' ? 'bg-white border border-gray-200 shadow-lg' : 'glass-card'} p-6 rounded-2xl h-full`}>
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} flex items-center justify-center ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} font-bold text-2xl font-display`}>
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <p className={`font-display font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} text-xl`}>{session?.user?.name || 'Pengguna'}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>Role: <span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-200'}`}>{session?.user.role}</span></p>
                </div>
            </div>
            <h3 className={`font-display text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-3`}>Kelola Profil</h3>
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <div className="space-y-4">
                <div>
                    <label className={`block text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} mb-1`}>Nama</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`} />
                </div>
                <div>
                    <label className={`block text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} mb-1`}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`} />
                </div>
                <div className="pt-2">
                    <label className={`block text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'} mb-1`}>Ganti Password</label>
                    <input type="password" placeholder="Password saat ini" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all mb-2`} />
                    <input type="password" placeholder="Password baru (min 8)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-700 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400'} focus:ring-2 focus:ring-opacity-50 transition-all`} />
                </div>
                <button disabled={!canSave || saving} onClick={handleSave} className={`w-full ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all mt-4`}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
        </div>
    );
};

// Komponen untuk menampilkan tantangan yang dibuat pengguna
const CreatedChallengeManager = ({ challenge, onApprove, onReview, onView3D }) => {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-display text-xl font-bold text-white">{challenge.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-lime-300">{challenge.status}</span></p>
                    </div>
                    {challenge.solver && (
                        <Link href={`/chat/${challenge.id}`} className="btn-secondary text-sm flex-shrink-0">
                            <FaComments /> Chat
                        </Link>
                    )}
                </div>
            </div>
            {/* Area Proposal & Submission */}
            <div className="bg-gray-900/50 px-6 py-4 space-y-4">
                {challenge.status === 'OPEN' && (
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Proposal Masuk ({challenge.proposals?.length || 0})</h4>
                        {challenge.proposals?.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {challenge.proposals.map(p => (
                                    <div key={p.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                        <p className="text-sm text-gray-200 font-semibold">{p.author.name}</p>
                                        <button onClick={() => onApprove(p.id)} className="btn-primary text-xs !py-1 !px-3"><FaCheck /> Setujui</button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">Belum ada proposal.</p>}
                    </div>
                )}
                {['IN_PROGRESS', 'COMPLETED', 'DONE'].includes(challenge.status) && (
                     <div>
                        <h4 className="font-semibold text-gray-300 mb-2">Hasil Pekerjaan</h4>
                        {challenge.submissions?.length > 0 ? (
                             <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                 <div>
                                    <p className="text-sm text-gray-200 font-semibold">Dari: {challenge.solver.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <button onClick={() => onView3D(challenge.submissions[0].fileUrl)} className="text-lime-400 hover:underline text-xs font-semibold inline-flex items-center gap-1.5"><FaCube /> Lihat 3D</button>
                                        <a href={challenge.submissions[0].fileUrl} download className="text-gray-400 hover:underline text-xs font-semibold inline-flex items-center gap-1.5"><FaDownload /> Unduh</a>
                                    </div>
                                 </div>
                                 {challenge.submissions[0].status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => onReview(challenge.submissions[0].id, 'REVISION_REQUESTED')} className="bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-600">Revisi</button>
                                        <button onClick={() => onReview(challenge.submissions[0].id, 'APPROVED')} className={`${theme === 'light' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs font-bold py-1 px-2 rounded-md`}>Setujui</button>
                                    </div>
                                 )}
                             </div>
                        ) : <p className="text-sm text-gray-500">Belum ada hasil pekerjaan.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};


const UserDashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  
  const [myChallenges, setMyChallenges] = useState<MyChallenge[]>([]);
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
  const [myLibrary, setMyLibrary] = useState<MyLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'Dibuat' | 'Dikerjakan' | 'Diajukan'>('Dibuat');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null);

  const fetchData = async (currentView: string) => {
    setIsLoading(true);
    try {
        let res;
        if (currentView === 'Dibuat') res = await fetch('/api/akun/challenges');
        else if (currentView === 'Dikerjakan') res = await fetch('/api/akun/accepted-challenges');
        else res = await fetch('/api/akun/proposed-challenges');
        
        if (res.ok) {
            const data = await res.json();
            if (currentView === 'Dibuat') setMyChallenges(data);
            else if (currentView === 'Dikerjakan') setAcceptedChallenges(data);
            else setMyProposals(data);
        }
    } catch (error) { console.error('Gagal mengambil data:', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetchData(view);
      // Fetch library data in background
      fetch('/api/akun/library').then(res => res.ok && res.json().then(setMyLibrary));
    }
  }, [status, router, view]);

  const handleApprove = async (proposalId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui proposal ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`/api/proposals/${proposalId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyetujui proposal.');
      alert('Proposal berhasil disetujui!');
      fetchData(view);
    } catch(err: unknown) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
      else alert('Terjadi kesalahan yang tidak diketahui.');
    }
  };

  const handleReview = async (submissionId: number, decision: 'APPROVED' | 'REVISION_REQUESTED') => {
    const msg = decision === 'APPROVED' ? 'MENYETUJUI' : 'MEMINTA REVISI';
    if (!window.confirm(`Apakah Anda yakin ingin ${msg} hasil pekerjaan ini?`)) return;
    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision })
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal meninjau submission.');
      alert('Submission berhasil ditinjau!');
      fetchData(view);
    } catch(err: unknown) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
      else alert('Terjadi kesalahan yang tidak diketahui.');
    }
  };

  const handleView3D = (fileUrl: string) => setModelViewerSrc(fileUrl);
  const handleCloseModal = () => setSelectedChallenge(null);

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-300">Memuat...</div>;
  }

  const renderContent = () => {
    if (isLoading) return <p className="text-center text-slate-600 dark:text-gray-400">Memuat...</p>;

    switch (view) {
        case 'Dibuat':
            return myChallenges.length > 0 ? (
                <div className="space-y-6">
                    {myChallenges.map(c => <CreatedChallengeManager key={c.id} challenge={c} onApprove={handleApprove} onReview={handleReview} onView3D={handleView3D} />)}
                </div>
            ) : <EmptyState message="Anda belum membuat tantangan." actionText="Buat Tantangan Baru" actionLink="/tantangan/baru" />;
        
        case 'Dikerjakan':
            return acceptedChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptedChallenges.map(c => <ChallengeCard key={c.id} challenge={c} onClick={() => setSelectedChallenge(c)} />)}
                </div>
            ) : <EmptyState message="Anda belum mengerjakan tantangan." actionText="Cari Tantangan" actionLink="/tantangan" />;

        case 'Diajukan':
             return myProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myProposals.map(p => <ChallengeCard key={p.id} challenge={p.challenge} onClick={() => {}} />)}
                </div>
            ) : <EmptyState message="Anda belum mengajukan proposal." actionText="Cari Tantangan" actionLink="/tantangan" />;
        default: return null;
    }
  };
  
  const EmptyState = ({ message, actionText, actionLink }: any) => (
      <div className={`text-center py-16 px-6 ${theme === 'light' ? 'bg-white shadow-lg border border-gray-200' : 'glass-card'} rounded-2xl`}>
          <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{message}</h3>
          <Link href={actionLink} className={`mt-4 inline-block ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg transition-colors`}>
              {actionText}
          </Link>
      </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-900 min-h-screen text-slate-900 dark:text-gray-50 flex flex-col transition-colors duration-300">
        <Header />
        <main className="flex-grow pt-28 pb-20">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-12 gap-y-8">
              <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit z-10">
                <ProfilePanel />
              </aside>

              <section className="lg:col-span-3 space-y-8">
                <div>
                    <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">Dashboard Saya</h1>
                    <p className="text-lg text-slate-600 dark:text-gray-400 mt-1">Selamat datang kembali, {session.user?.name}!</p>
                </div>
                
                <div className={`${theme === 'light' ? 'bg-white shadow-lg border border-gray-200' : 'glass-card'} p-6 rounded-2xl`}>
                    <div className={`flex border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} mb-6`}>
                        {['Dibuat', 'Dikerjakan', 'Diajukan'].map(tab => (
                            <button key={tab} onClick={() => setView(tab as 'Dibuat' | 'Dikerjakan' | 'Diajukan')} 
                                className={`py-2 px-4 text-sm font-semibold transition-colors ${view === tab ? 
                                  theme === 'light' 
                                    ? 'border-b-2 border-blue-600 text-blue-600' 
                                    : 'border-b-2 border-lime-400 text-lime-300' 
                                  : theme === 'light'
                                    ? 'text-slate-600 hover:text-slate-900'
                                    : 'text-gray-400 hover:text-white'
                                }`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {renderContent()}
                </div>

                {(session.user.role === 'DESAINER' || session.user.role === 'ADMIN') && (
                  <div className={`${theme === 'light' ? 'bg-white shadow-lg border border-gray-200' : 'glass-card'} p-6 rounded-2xl`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Perpustakaan Saya</h2>
                        <Link href="/perpustakaan/upload" className={`${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2`}><FaPlus /> Unggah</Link>
                    </div>
                    {myLibrary.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {myLibrary.map(it => (
                                <div key={it.id} className={`${theme === 'light' ? 'bg-gray-100 border border-gray-200' : 'bg-gray-800'} rounded-lg overflow-hidden`}>
                                    <div className={`relative h-24 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}>
                                        {it.posterUrl && <Image src={it.posterUrl} alt={it.title} fill className="object-cover" />}
                                    </div>
                                    <div className="p-2">
                                        <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{it.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-600 dark:text-gray-500">Anda belum mengunggah aset apa pun.</p>}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      
      {/* Modals */}
      {selectedChallenge && <BengkelDetailModal challenge={selectedChallenge} onClose={handleCloseModal} onSubmissionSuccess={() => fetchData('Dikerjakan')} onView3D={handleView3D} />}
      {modelViewerSrc && <ThreeDViewerModal src={modelViewerSrc} onClose={() => setModelViewerSrc(null)} />}

      <style jsx global>{`
        .glass-card { 
          background: rgba(31, 41, 55, 0.4); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </>
  );
};

export default UserDashboardPage;
