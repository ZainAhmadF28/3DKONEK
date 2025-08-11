// src/components/Footer.tsx
'use client';

import React from 'react';
import { FaCogs } from 'react-icons/fa';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center font-extrabold text-xl mb-3 text-slate-900 dark:text-gray-100">
            <FaCogs className={`mr-2 ${theme === 'light' ? 'text-green-600' : 'text-lime-400'}`} />
            <span>3D<span className={theme === 'light' ? 'text-green-600' : 'text-lime-400'}>KONEK</span></span>
          </div>
          <p className="text-slate-600 dark:text-gray-400">Kolaborasi Kita, Rekayasa Bangsa. Platform kolaborasi untuk kemandirian komponen 3D Indonesia.</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">Tautan</h3>
          <ul className="space-y-2">
            <li><Link href="/tantangan" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Tantangan</Link></li>
            <li><Link href="/perpustakaan" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Perpustakaan</Link></li>
            <li><Link href="/edukasi" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Edukasi</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-3">Perusahaan</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Tentang Kami</a></li>
            <li><a href="#" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">Kontak</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-500 dark:text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 3DKONEK. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;