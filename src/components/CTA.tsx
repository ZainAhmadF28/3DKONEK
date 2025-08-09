// src/components/CTA.tsx
import React from 'react';
import { FaUserPlus } from 'react-icons/fa';

const CTA = () => {
  return (
    <section className="bg-gradient-to-r from-[#0a2540] to-[#0052cc] text-white py-20 px-6">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Mulai Perjalanan Desain 3D-mu Hari Ini
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Daftar ke 3DKONEK untuk belajar, berkolaborasi, dan berkarya bersama komunitas 3D.
        </p>
        <button className="bg-[#ff6b35] hover:bg-[#ff5500] text-white font-bold py-4 px-10 rounded-full flex items-center transition-transform transform hover:-translate-y-1 shadow-lg text-xl mx-auto">
          <FaUserPlus className="mr-3" />
          Daftar Sekarang
        </button>
      </div>
    </section>
  );
};

export default CTA;