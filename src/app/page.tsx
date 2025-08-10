'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModernLanding from '@/components/ModernLanding';

export default function Home() {
  return (
    // Latar belakang utama untuk mode terang dan gelap
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-200 transition-colors duration-300">
      <Header />
      <main>
        <ModernLanding />
      </main>
      <Footer />
    </div>
  );
}