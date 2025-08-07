// src/components/Hero.tsx
import React from 'react';
import { FaBolt, FaHandsHelping } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="beranda" className="bg-gradient-to-r from-[#0052cc] to-[#00c6ff] text-white min-h-screen flex items-center pt-20">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
        <div className="hero-text text-center md:text-left">
          <h1 className="font-extrabold text-4xl md:text-5xl leading-tight mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Kolaborasi Kita, Rekayasa Bangsa.
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Menjadi tulang punggung digital bagi kemandirian teknologi dan manufaktur Indonesia.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button className="bg-[#ff6b35] hover:bg-[#ff5500] text-white font-bold py-3 px-8 rounded-full flex items-center transition-transform transform hover:-translate-y-1 shadow-lg">
              <FaBolt className="mr-2" />
              Lihat Tantangan
            </button>
          </div>
        </div>
        <div className="hero-illustration flex justify-center items-center">
            <div className="relative w-96 h-96 flex justify-center items-center">
                <div className="absolute w-full h-full border-8 border-white/20 rounded-full animate-spin-slow"></div>
                <div className="absolute w-3/4 h-3/4 border-4 border-dashed border-white/30 rounded-full animate-spin-slower"></div>
                <FaHandsHelping size={120} className="text-white animate-pulse" />
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;