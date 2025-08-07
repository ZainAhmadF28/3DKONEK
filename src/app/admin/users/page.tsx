'use client';

import { useState, useEffect } from 'react';
import type { User } from '@prisma/client';

// Setelah `npx prisma generate`, TypeScript akan melihat 'role' di dalam tipe `User`
// dan error di baris ini akan hilang.
type UserData = Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'>;

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Manajemen Pengguna</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {loading ? (
          <p>Memuat data pengguna...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bergabung</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {/* Error di sini juga akan hilang karena user.role akan dikenali sebagai string */}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
