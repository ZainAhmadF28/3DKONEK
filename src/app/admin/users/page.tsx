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

  const createUser = async () => {
    const name = prompt('Nama:') || '';
    const email = prompt('Email:') || '';
    const password = prompt('Password: (min 8)') || '';
    const role = prompt('Role (ADMIN/UMUM/DESAINER):') || 'UMUM';
    if (!email || password.length < 8) return alert('Email dan password tidak valid');
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role }) });
    if (res.ok) {
      const created = await res.json();
      setUsers((u) => [created, ...u]);
    }
  };

  const updateUser = async (u: UserData) => {
    const name = prompt('Nama:', u.name || '') || '';
    const email = prompt('Email:', u.email) || u.email;
    const role = prompt('Role (ADMIN/UMUM/DESAINER):', u.role) || u.role;
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, name, email, role }) });
    if (res.ok) {
      const nu = await res.json();
      setUsers((list) => list.map((x) => (x.id === u.id ? nu : x)));
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) setUsers((list) => list.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
        <button onClick={createUser} className="bg-indigo-600 text-white text-sm px-3 py-2 rounded">+ User</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        {loading ? (
          <p>Memuat data pengguna...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bergabung</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => updateUser(user)} className="text-indigo-600 text-sm mr-3">Edit</button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 text-sm">Hapus</button>
                  </td>
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
