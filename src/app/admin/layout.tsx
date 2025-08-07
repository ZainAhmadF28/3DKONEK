import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Ini adalah gerbang keamanan utama.
  // Jika tidak ada sesi, atau user bukan ADMIN, redirect ke halaman login.
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}