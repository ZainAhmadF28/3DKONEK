'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
// =======================================================
// == PERBAIKAN UTAMA ADA DI SINI: FaDownload ditambahkan ==
// =======================================================
import { FaFilePdf, FaCheck, FaComments, FaCube, FaDownload } from 'react-icons/fa';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import BengkelDetailModal from '@/components/BengkelDetailModal';
import ProposalStatusBadge from '@/components/ProposalStatusBadge';
import ThreeDViewerModal from '@/components/ThreeDViewerModal';
import { useMemo } from 'react';

const ProfilePanel = () => {
  const { data: session } = useSession();
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
    <div>
      <p className="text-xs text-slate-500 mb-3">Kelola profil akun</p>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-semibold">Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="pt-2">
          <label className="block text-xs font-semibold">Ganti Password</label>
          <input type="password" placeholder="Password saat ini" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-2" />
          <input type="password" placeholder="Password baru (min 8)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <button disabled={!canSave || saving} onClick={handleSave} className="w-full bg-indigo-600 text-white text-sm py-2 rounded disabled:bg-indigo-300">{saving ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </div>
  );
};

// Tipe data untuk proposal yang diajukan
interface MyProposal {
    id: number;
    status: string;
    challenge: Challenge;
}

// Tipe data untuk tantangan yang dibuat
interface MyChallenge extends Challenge {
    proposals: {
        id: number;
        message: string;
        fileUrl: string | null;
        status: string;
        author: {
            name: string | null;
        }
    }[];
    submissions: {
        id: number;
        fileUrl: string;
        notes: string | null;
        status: string;
        author: {
            name: string | null;
        }
    }[];
    solver: {
        id: number;
        name: string | null;
    } | null;
}

const UserDashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [myChallenges, setMyChallenges] = useState<MyChallenge[]>([]);
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [myProposals, setMyProposals] = useState<MyProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myLibrary, setMyLibrary] = useState<Array<{id:number; title:string; isPaid:boolean; price:number; isApproved:boolean; posterUrl?:string|null}>>([]);
  const [view, setView] = useState<'Dibuat' | 'Dikerjakan' | 'Diajukan'>('Dibuat');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [modelViewerSrc, setModelViewerSrc] = useState<string | null>(null);

  const fetchMyChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/akun/challenges');
      if (res.ok) setMyChallenges(await res.json());
    } catch (error) { console.error('Gagal mengambil tantangan saya:', error); } 
    finally { setIsLoading(false); }
  };

  const fetchAcceptedChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/akun/accepted-challenges');
      if (res.ok) setAcceptedChallenges(await res.json());
    } catch (error) { console.error('Gagal mengambil tantangan yang dikerjakan:', error); } 
    finally { setIsLoading(false); }
  }

  const fetchMyProposals = async () => {
    setIsLoading(true);
    try {
        const res = await fetch('/api/akun/proposed-challenges');
        if (res.ok) setMyProposals(await res.json());
    } catch (error) { console.error('Gagal mengambil proposal yang diajukan:', error); }
    finally { setIsLoading(false); }
  }

  const fetchMyLibrary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/akun/library');
      if (res.ok) setMyLibrary(await res.json());
    } catch (e) { console.error('Gagal mengambil perpustakaan saya:', e); }
    finally { setIsLoading(false); }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      if (view === 'Dibuat') {
        fetchMyChallenges();
      } else if (view === 'Dikerjakan') {
        fetchAcceptedChallenges();
      } else { // 'Diajukan'
        fetchMyProposals();
      }
      // Selalu refresh library juga di background
      fetchMyLibrary();
    }
  }, [status, router, view]);

  const handleApprove = async (proposalId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui proposal ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(`/api/proposals/${proposalId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyetujui proposal.');
      alert('Proposal berhasil disetujui!');
      fetchMyChallenges();
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
      fetchMyChallenges();
    } catch(err: unknown) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
      else alert('Terjadi kesalahan yang tidak diketahui.');
    }
  };

  const handleCardClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  const handleView3D = (fileUrl: string) => {
    setModelViewerSrc(fileUrl);
  };

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  const renderCreatedChallenges = () => (
    myChallenges.length > 0 ? (
      <div className="space-y-8">
        {myChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-full sm:w-32 h-32 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {challenge.images[0] && <Image src={challenge.images[0].url} layout="fill" objectFit="cover" alt={challenge.title} />}
              </div>
              <div className="flex-grow w-full">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">{challenge.title}</h3>
                          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${challenge.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>Status: {challenge.status}</span>
                      </div>
                      {challenge.status !== 'OPEN' && challenge.solver && (<Link href={`/chat/${challenge.id}`} className="bg-slate-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-slate-700 flex items-center gap-1 flex-shrink-0"><FaComments /> Chat</Link>)}
                  </div>
                   {challenge.status === 'OPEN' && (
                     <div className="mt-4">
                       <h4 className="font-semibold text-slate-600 border-b pb-2 mb-2">Proposal Masuk ({challenge.proposals?.length || 0})</h4>
                       {challenge.proposals?.length > 0 ? (
                         <ul className="space-y-3 max-h-48 overflow-y-auto">
                           {challenge.proposals.map(p => (
                             <li key={p.id} className="bg-slate-50 p-3 rounded-md border flex justify-between items-start">
                               <div>
                                 <p className="font-semibold">{p.author.name}</p>
                                 <p className="text-sm text-gray-600 mt-1">&quot;{p.message}&quot;</p>
                                 {p.fileUrl && (
                                   <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-2 inline-flex items-center gap-1"><FaFilePdf /> Lihat PDF</a>
                                 )}
                               </div>
                               <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 flex items-center gap-1"><FaCheck /> Setujui</button>
                             </li>
                           ))}
                         </ul>
                       ) : (
                         <p className="text-sm text-gray-500">Belum ada proposal.</p>
                       )}
                     </div>
                   )}
                   {['IN_PROGRESS', 'COMPLETED', 'DONE'].includes(challenge.status) && (
                     <div className="mt-4">
                       <h4 className="font-semibold text-slate-600 border-b pb-2 mb-2">Hasil Pekerjaan ({challenge.submissions?.length || 0})</h4>
                       {challenge.submissions?.length > 0 ? (
                         <ul className="space-y-3 max-h-48 overflow-y-auto">
                           {challenge.submissions.map(s => (
                             <li key={s.id} className="bg-slate-50 p-3 rounded-md border">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <p className="font-semibold">{s.author.name}</p>
                                   <p className="text-sm text-gray-600 mt-1">&quot;{s.notes || 'Tidak ada catatan.'}&quot;</p>
                                   <div className="flex items-center gap-4 mt-2">
                                     <button onClick={(e) => { e.preventDefault(); handleView3D(s.fileUrl);}} className="text-indigo-600 hover:underline text-sm inline-flex items-center gap-1.5 font-semibold"><FaCube /> Lihat Model 3D</button>
                                     <a href={s.fileUrl} download className="text-gray-600 hover:underline text-sm inline-flex items-center gap-1.5 font-semibold"><FaDownload /> Unduh File</a>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                   {s.status === 'PENDING' ? (
                                     <>
                                       <button onClick={() => handleReview(s.id, 'REVISION_REQUESTED')} className="bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-600">Revisi</button>
                                       <button onClick={() => handleReview(s.id, 'APPROVED')} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">Setujui</button>
                                     </>
                                   ) : (
                                     <span className={`text-sm font-bold ${s.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{s.status}</span>
                                   )}
                                 </div>
                               </div>
                             </li>
                           ))}
                         </ul>
                       ) : (
                         <p className="text-sm text-gray-500">Pekerja belum mengumpulkan hasil.</p>
                       )}
                     </div>
                   )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (<div className="text-center py-10 border-2 border-dashed rounded-lg"><p className="text-slate-500">Anda belum membuat tantangan apa pun.</p><Link href="/tantangan/baru" className="text-indigo-600 font-semibold mt-2 inline-block">Buat tantangan pertama Anda!</Link></div>)
  );

  const renderAcceptedChallenges = () => (
    acceptedChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedChallenges.map(challenge => (<div key={challenge.id} className="bg-white rounded-lg shadow-lg flex flex-col"><ChallengeCard challenge={challenge} onClick={() => handleCardClick(challenge)} /><div className="p-4 border-t"><Link href={`/chat/${challenge.id}`} className="w-full text-center block bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2"><FaComments /> Buka Chat Diskusi</Link></div></div>))}
        </div>
    ) : (<div className="text-center py-10 border-2 border-dashed rounded-lg"><p className="text-slate-500">Anda belum mengerjakan tantangan apa pun.</p><Link href="/tantangan" className="text-indigo-600 font-semibold mt-2 inline-block">Cari tantangan untuk dikerjakan!</Link></div>)
  );
  
  const renderMyProposals = () => (
    myProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProposals.map(proposal => (
                <div key={proposal.id} className="bg-white rounded-lg shadow-lg flex flex-col">
                    <ChallengeCard challenge={proposal.challenge} onClick={() => {}} />
                    <div className="p-3 border-t bg-slate-50 flex justify-between items-center">
                        <ProposalStatusBadge status={proposal.status} />
                        {proposal.status === 'APPROVED' && (
                            <Link href={`/chat/${proposal.challenge.id}`} className="bg-slate-600 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-slate-700 flex items-center gap-1">
                                <FaComments /> Chat
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    ) : (<div className="text-center py-10 border-2 border-dashed rounded-lg"><p className="text-slate-500">Anda belum mengajukan proposal apa pun.</p><Link href="/tantangan" className="text-indigo-600 font-semibold mt-2 inline-block">Cari tantangan untuk diajukan!</Link></div>)
  );

  return (
    <>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow pt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <aside className="lg:col-span-1 bg-white rounded-lg shadow p-4 h-max">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{session.user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-slate-500">Role: <span className="font-semibold">{session.user.role}</span></p>
                  </div>
                </div>
                <ProfilePanel />
              </aside>

              {/* Konten utama */}
              <section className="lg:col-span-3">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Saya</h1>
                <p className="text-slate-600 mb-4">Selamat datang kembali, {session.user?.name}!</p>
                <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex border-b mb-6 overflow-x-auto">
                  <button onClick={() => setView('Dibuat')} className={`py-2 px-4 text-sm sm:text-base transition-colors flex-shrink-0 ${view === 'Dibuat' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>Tantangan Dibuat</button>
                  <button onClick={() => setView('Dikerjakan')} className={`py-2 px-4 text-sm sm:text-base transition-colors flex-shrink-0 ${view === 'Dikerjakan' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>Tantangan Dikerjakan</button>
                  <button onClick={() => setView('Diajukan')} className={`py-2 px-4 text-sm sm:text-base transition-colors flex-shrink-0 ${view === 'Diajukan' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>Proposal Diajukan</button>
              </div>
              
              {isLoading ? (<p>Memuat...</p>) : view === 'Dibuat' ? renderCreatedChallenges() : view === 'Dikerjakan' ? renderAcceptedChallenges() : renderMyProposals()}
                </div>

            {/* Seksi Perpustakaan Saya (untuk desainer) */}
            {(session.user.role === 'DESAINER' || session.user.role === 'ADMIN') && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Perpustakaan Desain Saya</h2>
                  <Link href="/perpustakaan/upload" className="text-sm bg-indigo-600 text-white px-3 py-2 rounded">+ Unggah</Link>
                </div>
                {myLibrary.length === 0 ? (
                  <p className="text-slate-500">Belum ada desain yang Anda unggah.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myLibrary.map(it => (
                      <div key={it.id} className="border rounded overflow-hidden">
                        <div className="relative h-32 bg-slate-100">
                          {it.posterUrl && <Image src={it.posterUrl} alt={it.title} fill className="object-cover" />}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-800 truncate mr-2">{it.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${it.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{it.isApproved ? 'Approved' : 'Pending'}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{it.isPaid ? `Berbayar • Rp ${new Intl.NumberFormat('id-ID').format(it.price)}` : 'Gratis'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <BengkelDetailModal 
        challenge={selectedChallenge || undefined as unknown as Challenge}
        onClose={handleCloseModal}
        onSubmissionSuccess={fetchAcceptedChallenges}
        onView3D={handleView3D}
      />

      {modelViewerSrc && (
        <ThreeDViewerModal 
          src={modelViewerSrc} 
          onClose={() => setModelViewerSrc(null)} 
        />
      )}
    </>
  );
};

export default UserDashboardPage;
