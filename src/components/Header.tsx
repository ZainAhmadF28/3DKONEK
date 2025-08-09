'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  FaCogs, FaUserPlus, FaSignInAlt, FaSignOutAlt, 
  FaTachometerAlt, FaUserCircle, FaTools,
  FaGraduationCap
} from 'react-icons/fa';
import { useForum } from '@/context/ForumContext';

const Header = () => {
  const { data: session, status } = useSession();
  const {} = useForum();

  return (
    <header className="bg-gradient-to-r from-[#0052cc] to-[#00c6ff] text-white p-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center font-bold text-2xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FaCogs className="text-[#ff6b35]" />
            <span>KitaRekayasa</span>
          </Link>
        </div>

        <nav className="hidden md:flex">
          <ul className="flex space-x-6 items-center">
            <li><Link href="/" className="hover:text-gray-200">Beranda</Link></li>
            <li><Link href="/tantangan" className="hover:text-gray-200">Tantangan</Link></li>
            <li><Link href="/perpustakaan" className="hover:text-gray-200">Perpustakaan</Link></li>
            
            {/* 2. Tambahkan Link Edukasi Baru */}
            <li>
              <Link href="/edukasi" className="hover:text-gray-200 font-semibold flex items-center gap-2">
                <FaGraduationCap /> Edukasi
              </Link>
            </li>


            {status === 'authenticated' && session.user.role !== 'ADMIN' && (
              <li>
                <Link href="/bengkel" className="hover:text-gray-200 flex items-center gap-2">
                  <FaTools /> Bengkel Saya
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="text-sm">Memuat...</div>
          ) : session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-bold py-2 px-4 rounded-full flex items-center transition-colors shadow-md text-sm">
                  <FaTachometerAlt className="mr-2" />
                  Admin
                </Link>
              )}

              {session.user.role !== 'ADMIN' && (
                <Link href="/akun/dashboard" className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-full flex items-center transition-colors shadow-md text-sm">
                  <FaUserCircle className="mr-2" />
                  Dashboard Saya
                </Link>
              )}

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors shadow-md text-sm"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-transparent hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full flex items-center transition-colors">
                <FaSignInAlt className="mr-2" />
                Login
              </Link>
              <Link href="/register" className="bg-[#ff6b35] hover:bg-[#ff5500] text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors shadow-md">
                <FaUserPlus className="mr-2" />
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
