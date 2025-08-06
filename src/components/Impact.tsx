// src/components/Impact.tsx
import React from 'react';
import { FaChartLine, FaIndustry, FaGraduationCap, FaDatabase, FaBrain } from 'react-icons/fa';

const impactData = [
  { icon: <FaChartLine />, title: "Efisiensi Industri Nasional" },
  { icon: <FaIndustry />, title: "Kebangkitan Manufaktur Lokal" },
  { icon: <FaGraduationCap />, title: "\"Link and Match\" Sebenarnya" },
  { icon: <FaDatabase />, title: "Database Strategis" },
  { icon: <FaBrain />, title: "Perubahan Pola Pikir" },
];

const Impact = () => {
  return (
    <section id="dampak" className="py-20 px-6">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-[#0a2540] mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>Dampak untuk Kemandirian Bangsa</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-[#0052cc] to-[#00c6ff] mx-auto mb-16"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {impactData.map((item, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-5xl text-[#0052cc] mb-4 inline-block">{item.icon}</div>
              <h3 className="text-md font-semibold text-[#0a2540]">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;