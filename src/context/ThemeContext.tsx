'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

// Tipe untuk nilai yang akan disediakan oleh context
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Buat Context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Buat Provider Komponen
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('dark'); // Default ke mode gelap

  useEffect(() => {
    // Cek tema yang tersimpan di localStorage saat komponen dimuat
    const storedTheme = window.localStorage.getItem('theme');
    // Juga cek preferensi sistem pengguna
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
        // Jika tidak ada preferensi tersimpan, gunakan preferensi sistem
        setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Terapkan class 'dark' atau hapus dari elemen <html>
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Simpan preferensi tema
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook kustom untuk menggunakan context dengan mudah
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Komponen Tombol Pengalih Tema
export const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();

    // Jangan render tombol sampai tema selesai dimuat dari client-side
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-lg hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
    );
}
