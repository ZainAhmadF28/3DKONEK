'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaUsers, FaTasks, FaImages, FaComments, FaBook, FaSitemap } from 'react-icons/fa';

const AdminSidebar = () => {
  const pathname = usePathname();
  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Pengguna', href: '/admin/users', icon: FaUsers },
    { name: 'Tantangan', href: '/admin/challenges', icon: FaTasks },
    { name: 'Perpustakaan', href: '/admin/library', icon: FaBook },
    { name: 'Galeri', href: '/admin/gallery', icon: FaImages },
    { name: 'Forum', href: '/admin/forum', icon: FaComments },
    { name: 'Komunitas', href: '/admin/communities', icon: FaSitemap },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
      <h2 className="text-2xl font-semibold mb-8 text-center">Admin Panel</h2>
      <nav>
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}>
                  <link.icon />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;