'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModernLanding from '@/components/ModernLanding';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-gray-200 transition-colors duration-300">
      <Header />
      <main>
        <ModernLanding />
      </main>
      <Footer />
    </div>
  );
}