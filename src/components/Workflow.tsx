// src/components/Workflow.tsx
import React from 'react';

// Data untuk setiap langkah dalam alur kerja
const workflowData = [
  {
    step: "1",
    title: "Publikasi Tantangan (Call for Help)",
    description: "Pengusaha mengunggah detail komponen yang rusak, menetapkan imbalan, dan menerbitkan tantangan."
  },
  {
    step: "2",
    title: "Kolaborasi Terbuka (Open Collaboration)",
    description: "Talenta (mahasiswa, insinyur, manufaktur) berkolaborasi dalam ruang virtual untuk membuat solusi."
  },
  {
    step: "3",
    title: "Iterasi Desain & Prototipe",
    description: "Desain dikembangkan dengan masukan dari berbagai pihak dan dibuat prototipe."
  },
  {
    step: "4",
    title: "Produksi & Verifikasi",
    description: "Komponen diproduksi oleh manufaktur terpilih dan diverifikasi oleh pengusaha."
  },
  {
    step: "5",
    title: "Pencairan Imbalan & Reputasi",
    description: "Imbalan dicairkan sesuai kontribusi dan reputasi anggota tim meningkat."
  },
  {
    step: "6",
    title: "Menjadi Aset Digital Nasional",
    description: "Desain masuk ke Pustaka Komponen Nasional untuk digunakan di masa depan."
  }
];

const Workflow = () => {
  return (
    <section id="cara-kerja" className="py-20 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#0a2540] mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Alur Kerja Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dari masalah menjadi solusi, ini adalah alur kolaborasi untuk merekayasa kemandirian.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0052cc] to-[#00c6ff] mx-auto mt-4"></div>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-3xl mx-auto">
          {/* Garis Vertikal di Tengah */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-1 bg-blue-200"></div>

          {workflowData.map((item, index) => (
            <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              
              {/* Konten (Kiri atau Kanan) */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <h3 className="text-xl font-bold text-[#0052cc] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>

              {/* Titik di Tengah */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-[#0052cc] to-[#00c6ff] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                {item.step}
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;