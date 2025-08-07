import prisma from '@/lib/prisma';

const AdminDashboardPage = async () => {
  // Ambil data agregat dari server
  const userCount = await prisma.user.count();
  const challengeCount = await prisma.challenge.count();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-500">Total Pengguna</h3>
          <p className="text-4xl font-bold text-slate-800 mt-2">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-500">Total Tantangan</h3>
          <p className="text-4xl font-bold text-slate-800 mt-2">{challengeCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;