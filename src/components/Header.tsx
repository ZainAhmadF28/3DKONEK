'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FaCogs, FaUserPlus, FaSignInAlt, FaSignOutAlt, FaTachometerAlt, FaUserCircle, FaTools, FaGraduationCap, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
      <li><Link href="/" className="hover:text-lime-400 transition-colors" onClick={onClick}>Beranda</Link></li>
      <li><Link href="/tantangan" className="hover:text-lime-400 transition-colors" onClick={onClick}>Tantangan</Link></li>
      <li><Link href="/perpustakaan" className="hover:text-lime-400 transition-colors" onClick={onClick}>Perpustakaan</Link></li>
      <li><Link href="/edukasi" className="hover:text-lime-400 transition-colors flex items-center gap-2" onClick={onClick}><FaGraduationCap /> Edukasi</Link></li>
      {status === 'authenticated' && session?.user?.role !== 'ADMIN' && (
        <li><Link href="/bengkel" className="hover:text-lime-400 transition-colors flex items-center gap-2" onClick={onClick}><FaTools /> Bengkel Saya</Link></li>
      )}
    </ul>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="backdrop-blur-sm bg-gray-900/60 border-b border-white/10 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <FaCogs className="text-lime-400" />
              <span className="font-extrabold tracking-tight text-white">Kita<span className="text-lime-400">Rekayasa</span></span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="text-sm text-gray-300">Memuat...</div>
            ) : session ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-100 text-yellow-900 px-3 py-2 text-sm font-semibold hover:bg-yellow-200 transition-colors">
                    <FaTachometerAlt /> Admin
                  </Link>
                )}
                {session.user.role !== 'ADMIN' && (
                  <Link href="/akun/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10 transition-colors">
                    <FaUserCircle /> Dashboard
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="inline-flex items-center gap-2 rounded-lg bg-lime-400 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-lime-300 transition-colors">
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10 transition-colors">
                  <FaSignInAlt /> Login
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-lime-400 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-lime-300 transition-colors">
                  <FaUserPlus /> Daftar
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-white/20 text-gray-100" onClick={() => setOpen(true)} aria-label="Buka menu">
            <FaBars />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80%] bg-gray-900 text-gray-100 shadow-xl p-5 flex flex-col border-l border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-lg">Menu</span>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/20" onClick={() => setOpen(false)} aria-label="Tutup menu">
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
                    <Link href="/admin" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-yellow-300 bg-yellow-100 text-yellow-900 px-3 py-2 text-sm font-semibold hover:bg-yellow-200">
                      <span className="inline-flex items-center gap-2"><FaTachometerAlt /> Admin</span>
                    </Link>
                  )}
                  {session.user.role !== 'ADMIN' && (
                    <Link href="/akun/dashboard" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10">
                      <span className="inline-flex items-center gap-2"><FaUserCircle /> Dashboard</span>
                    </Link>
                  )}
                  <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }} className="w-full rounded-lg bg-lime-400 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-lime-300">
                    <span className="inline-flex items-center gap-2"><FaSignOutAlt /> Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10">
                    <span className="inline-flex items-center gap-2"><FaSignInAlt /> Login</span>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="block w-full text-left rounded-lg bg-lime-400 text-gray-900 px-3 py-2 text-sm font-semibold hover:bg-lime-300">
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
