'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  FaUserPlus, FaSignInAlt, FaSignOutAlt,
  FaTachometerAlt, FaUserCircle, FaTools, FaGraduationCap, FaBars, FaTimes,
  FaHome, FaTasks, FaBook
} from 'react-icons/fa';
import Image from 'next/image';
import { ThemeSwitcher, useTheme } from '@/context/ThemeContext';

const Header = () => {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
      <li><Link href="/" className={`${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-lime-400'} transition-colors flex items-center gap-2`} onClick={onClick}><FaHome /> Beranda</Link></li>
      <li><Link href="/tantangan" className={`${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-lime-400'} transition-colors flex items-center gap-2`} onClick={onClick}><FaTasks /> Tantangan</Link></li>
      <li><Link href="/perpustakaan" className={`${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-lime-400'} transition-colors flex items-center gap-2`} onClick={onClick}><FaBook /> Perpustakaan</Link></li>
      <li><Link href="/edukasi" className={`${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-lime-400'} transition-colors flex items-center gap-2`} onClick={onClick}><FaGraduationCap /> Edukasi</Link></li>
      {status === 'authenticated' && session?.user?.role !== 'ADMIN' && (
        <li><Link href="/bengkel" className={`${theme === 'light' ? 'hover:text-blue-600' : 'hover:text-lime-400'} transition-colors flex items-center gap-2`} onClick={onClick}><FaTools /> Bengkel Saya</Link></li>
      )}
    </ul>
  );

  return (
    <header className="w-full fixed top-0 z-50">
      <div className="backdrop-blur bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/50 dark:border-white/10 text-gray-800 dark:text-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="KitaRekayasa"
                width={120}
                height={120}
                className="w-24 h-24 md:w-28 md:h-28 object-contain"
                priority
              />
              <span className="sr-only">KitaRekayasa</span>
            </Link>
          </div>

          <nav className="hidden md:block">
             <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeSwitcher />
            {status === 'loading' ? (
              <div className="text-sm">Memuat...</div>
            ) : session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-100 dark:bg-yellow-300/20 text-yellow-700 dark:text-yellow-200 px-3 py-2 text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-300/30">
                    <FaTachometerAlt /> Admin
                  </Link>
                )}
                {session.user.role !== 'ADMIN' && (
                  <Link href="/akun/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-transparent text-gray-700 dark:text-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10">
                    <FaUserCircle /> Dashboard
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className={`inline-flex items-center gap-2 rounded-lg ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-lime-400 hover:bg-lime-300'} ${theme === 'light' ? 'text-white' : 'text-gray-900'} px-3 py-2 text-sm font-semibold`}>
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                 <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-transparent text-gray-700 dark:text-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10">
                  <FaSignInAlt /> Login
                </Link>
                <Link href="/register" className={`inline-flex items-center gap-2 rounded-lg ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-lime-400 hover:bg-lime-300'} ${theme === 'light' ? 'text-white' : 'text-gray-900'} px-3 py-2 text-sm font-semibold`}>
                  <FaUserPlus /> Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Theme Switcher dan Hamburger Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeSwitcher />
            <button
              className="inline-flex items-center justify-center h-12 w-12 rounded-md border border-black/15 dark:border-white/15"
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80%] bg-gray-900 text-gray-100 shadow-xl p-5 flex flex-col border-l border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-lg">Menu</span>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/15" onClick={() => setOpen(false)} aria-label="Tutup menu">
                <FaTimes />
              </button>
            </div>
            <nav className="mb-6">
              <NavLinks onClick={() => setOpen(false)} />
            </nav>
            <div className="mt-auto space-y-2">
              {status === 'loading' ? (
                <div className="text-sm text-gray-300">Memuat...</div>
              ) : session ? (
                <>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-yellow-400/40 bg-yellow-300/20 text-yellow-200 px-3 py-2 text-sm font-semibold hover:bg-yellow-300/30">
                      <span className="inline-flex items-center gap-2"><FaTachometerAlt /> Admin</span>
                    </Link>
                  )}
                  {session.user.role !== 'ADMIN' && (
                    <Link href="/akun/dashboard" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10">
                      <span className="inline-flex items-center gap-2"><FaUserCircle /> Dashboard</span>
                    </Link>
                  )}
                  <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }} className={`w-full rounded-lg ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} px-3 py-2 text-sm font-semibold`}>
                    <span className="inline-flex items-center gap-2"><FaSignOutAlt /> Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10">
                    <span className="inline-flex items-center gap-2"><FaSignInAlt /> Login</span>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className={`block w-full text-left rounded-lg ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} px-3 py-2 text-sm font-semibold`}>
                    <span className="inline-flex items-center gap-2"><FaUserPlus /> Daftar</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;