// src/components/Footer.tsx
'use client';

import React from 'react';
import { FaCogs } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center font-extrabold text-xl mb-3 text-gray-100">
            <FaCogs className="mr-2 text-lime-400" />
            <span>3D<span className="text-lime-400">KONEK</span></span>
          </div>
          <p className="text-gray-400">Kolaborasi Kita, Rekayasa Bangsa. Platform kolaborasi untuk kemandirian teknologi dan manufaktur Indonesia.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-100 mb-3">Tautan</h3>
          <ul className="space-y-2">
            <li><Link href="/tantangan" className="hover:text-white">Tantangan</Link></li>
            <li><Link href="/perpustakaan" className="hover:text-white">Perpustakaan</Link></li>
            <li><Link href="/edukasi" className="hover:text-white">Edukasi</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-100 mb-3">Perusahaan</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Tentang Kami</a></li>
            <li><a href="#" className="hover:text-white">Kontak</a></li>
            <li><a href="#" className="hover:text-white">Karir</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} 3DKONEK. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;