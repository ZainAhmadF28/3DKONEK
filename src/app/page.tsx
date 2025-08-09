'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModernLanding from '@/components/ModernLanding';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <ModernLanding />
      <Footer />
    </div>
  );
}