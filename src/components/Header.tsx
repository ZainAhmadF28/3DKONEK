// src/components/Header.tsx
import React from 'react';
import Link from 'next/link'; // Import Link dari Next.js
import { FaCogs, FaUserPlus } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-[#0052cc] to-[#00c6ff] text-white p-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center font-bold text-2xl">
          <Link href="/" className="flex items-center">
            <FaCogs className="mr-2 text-[#ff6b35]" />
            <span>KitaRekayasa</span>
          </Link>
        </div>
        <nav className="hidden md:flex">
          <ul className="flex space-x-8 items-center">
            <li><Link href="/" className="hover:text-gray-200">Beranda</Link></li>
            {/* INI YANG DIUBAH */}
            <li><Link href="/tantangan" className="hover:text-gray-200 font-semibold">Tantangan</Link></li>
            <li><Link href="/#fitur" className="hover:text-gray-200">Fitur</Link></li>
            <li><Link href="/#dampak" className="hover:text-gray-200">Dampak</Link></li>
          </ul>
        </nav>
        <button className="bg-[#ff6b35] hover:bg-[#ff5500] text-white font-bold py-2 px-6 rounded-full flex items-center transition-transform transform hover:-translate-y-1 shadow-lg">
          <FaUserPlus className="mr-2" />
          Daftar
        </button>
      </div>
    </header>
  );
};

export default Header;