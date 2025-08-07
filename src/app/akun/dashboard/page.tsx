'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { FaFilePdf, FaCheck, FaTimes, FaFileArchive, FaComments } from 'react-icons/fa';

// Tipe data yang diperluas untuk data yang dibutuhkan halaman ini
interface MyChallenge {
    id: number;
    title: string;
    status: string;
    images: { url: string }[];
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/akun/challenges');
      if (res.ok) {
        const data = await res.json();
        setMyChallenges(data);
      }
    } catch (error) {
      console.error('Gagal mengambil tantangan saya:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchMyChallenges();
    }
  }, [status, router]);

  const handleApprove = async (proposalId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui proposal ini? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    try {
        const res = await fetch(`/api/proposals/${proposalId}/approve`, { method: 'POST' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Gagal menyetujui proposal.');
        }
        alert('Proposal berhasil disetujui!');
        fetchMyChallenges();
    } catch(err: any) {
        alert(`Error: ${err.message}`);
    }
  };

  const handleReview = async (submissionId: number, decision: 'APPROVED' | 'REVISION_REQUESTED') => {
    const confirmationMessage = decision === 'APPROVED' 
      ? 'Apakah Anda yakin ingin MENYETUJUI hasil pekerjaan ini? Tantangan akan dianggap selesai.'
      : 'Apakah Anda yakin ingin MEMINTA REVISI untuk hasil pekerjaan ini?';

    if (!window.confirm(confirmationMessage)) return;

    try {
        const res = await fetch(`/api/submissions/${submissionId}/review`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Gagal meninjau submission.');
        }
        alert('Submission berhasil ditinjau!');
        fetchMyChallenges();
    } catch(err: any) {
        alert(`Error: ${err.message}`);
    }
  };

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-screen">Memuat...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Saya</h1>
            <p className="text-slate-600 mt-1">Kelola tantangan yang Anda buat.</p>
          </div>
          <div className="space-y-8">
            {isLoading ? (
              <p>Memuat tantangan Anda...</p>
            ) : myChallenges.length > 0 ? (
              myChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex gap-4 items-start">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {challenge.images[0] && <Image src={challenge.images[0].url} layout="fill" objectFit="cover" alt={challenge.title} />}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{challenge.title}</h3>
                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${challenge.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    Status: {challenge.status}
                                </span>
                            </div>
                            {challenge.status !== 'OPEN' && challenge.solver && (
                                <Link href={`/chat/${challenge.id}`} className="bg-slate-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-slate-700 flex items-center gap-1">
                                    <FaComments /> Chat dengan {challenge.solver.name}
                                </Link>
                            )}
                        </div>
                        
                        {challenge.status === 'OPEN' && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-slate-600 border-b pb-2 mb-2">Proposal Masuk ({challenge.proposals?.length || 0})</h4>
                            {challenge.proposals?.length > 0 ? (
                                <ul className="space-y-3">
                                    {challenge.proposals.map(proposal => (
                                        <li key={proposal.id} className="bg-slate-50 p-3 rounded-md border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{proposal.author.name}</p>
                                                    <p className="text-sm text-gray-600 mt-1">"{proposal.message}"</p>
                                                    {proposal.fileUrl && (
                                                        <a href={proposal.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-2 inline-flex items-center gap-1">
                                                            <FaFilePdf /> Lihat Proposal PDF
                                                        </a>
                                                    )}
                                                </div>
                                                <button onClick={() => handleApprove(proposal.id)} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 flex items-center gap-1">
                                                    <FaCheck /> Setujui
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada proposal yang masuk.</p>
                            )}
                          </div>
                        )}
                        
                        {['IN_PROGRESS', 'COMPLETED', 'DONE'].includes(challenge.status) && (
                          <div className="mt-4">
                             <h4 className="font-semibold text-slate-600 border-b pb-2 mb-2">Hasil Pekerjaan Masuk ({challenge.submissions?.length || 0})</h4>
                             {challenge.submissions?.length > 0 ? (
                                 <ul className="space-y-3">
                                     {challenge.submissions.map(submission => (
                                         <li key={submission.id} className="bg-slate-50 p-3 rounded-md border">
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <p className="font-semibold">{submission.author.name}</p>
                                                      <p className="text-sm text-gray-600 mt-1">"{submission.notes || 'Tidak ada catatan.'}"</p>
                                                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-2 inline-flex items-center gap-1"><FaFileArchive /> Lihat File .GLB</a>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      {submission.status === 'PENDING' ? (
                                                          <>
                                                              <button onClick={() => handleReview(submission.id, 'REVISION_REQUESTED')} className="bg-yellow-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-yellow-600">Minta Revisi</button>
                                                              <button onClick={() => handleReview(submission.id, 'APPROVED')} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">Setujui</button>
                                                          </>
                                                      ) : (
                                                          <span className={`text-sm font-bold ${submission.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{submission.status}</span>
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
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-slate-500">Anda belum membuat tantangan apa pun.</p>
                <Link href="/tantangan/baru" className="text-indigo-600 font-semibold mt-2 inline-block">Buat tantangan pertama Anda!</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboardPage;
