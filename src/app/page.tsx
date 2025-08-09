'use client';

// src/app/page.tsx
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Problems from '@/components/Problems';
import Workflow from '@/components/Workflow';
import Features from '@/components/Features';
import Impact from '@/components/Impact';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-[#f0f7ff]">
      <Header />
      <main>
        <Hero />
        <Problems />
        <Workflow />
        <Features />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}