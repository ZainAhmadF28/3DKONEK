// src/components/Problems.tsx
import React from 'react';
import { FaShippingFast, FaIndustry, FaUnlink, FaGem } from 'react-icons/fa';

const problemData = [
  { icon: <FaShippingFast />, title: "Ketergantungan Impor", description: "Industri berhenti produksi karena menunggu suku cadang impor yang mahal dan lama." },
  { icon: <FaIndustry />, title: "\"Kuburan Mesin\"", description: "Mesin berkualitas menjadi rongsokan karena satu komponen kritisnya rusak." },
  { icon: <FaUnlink />, title: "Kesenjangan \"Link and Match\"", description: "Talenta rekayasa tidak terhubung dengan masalah industri nyata." },
  { icon: <FaGem />, title: "Potensi Terpendam", description: "Potensi bengkel dan UKM manufaktur lokal belum tergali maksimal." }
];

const Problems = () => {
  return (
    <section id="masalah" className="py-20 px-6 bg-slate-50">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-[#0a2540] mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
          Masalah yang Kami Selesaikan
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-[#0052cc] to-[#00c6ff] mx-auto mb-16"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problemData.map((problem, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-[#ff6b35]">
              <div className="text-5xl text-[#0052cc] mb-6 inline-block">{problem.icon}</div>
              <h3 className="text-xl font-bold text-[#0a2540] mb-3">{problem.title}</h3>
              <p className="text-gray-600">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;