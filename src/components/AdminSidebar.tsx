'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaUsers, FaTasks, FaImages, FaComments, FaBook, FaSitemap } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

const AdminSidebar = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
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
    <aside className={`w-64 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border-r border-gray-200'} p-4 flex flex-col transition-colors duration-300`}>
      <h2 className={`text-2xl font-semibold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h2>
      <nav>
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700') 
                    : (theme === 'dark' ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                }`}>
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