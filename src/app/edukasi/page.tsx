'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaPlayCircle, FaBlender } from 'react-icons/fa';

// Tipe data untuk setiap modul pembelajaran
interface Module {
  id: number;
  title: string;
  description: string;
  videoId: string; // ID video dari URL YouTube
  duration: string;
}

// Data statis untuk modul-modul pembelajaran
const learningModules: Module[] = [
  {
    id: 1,
    title: 'Blender 4.0 Beginner Tutorial - Part 1',
    description: 'Mulai perjalanan Anda di dunia 3D dengan tutorial Blender paling ikonik. Pelajari navigasi dasar, modeling, dan pencahayaan dengan membuat sebuah donat yang lezat.',
    videoId: 'nIoXOplUvAw',
    duration: '18:52'
  },
  {
    id: 2,
    title: 'Modeling Karakter Low Poly Sederhana',
    description: 'Pelajari teknik modeling dasar untuk membuat karakter bergaya "low poly". Cocok untuk pemula yang ingin mencoba membuat aset game pertama mereka.',
    videoId: '01W_c-94_aY',
    duration: '25:10'
  },
  {
    id: 3,
    title: 'Pengenalan Sculpting di Blender',
    description: 'Masuki dunia sculpting digital. Pelajari kuas-kuas dasar dan teknik untuk memahat bentuk organik seperti karakter atau monster.',
    videoId: '7w-3_p_3a3A',
    duration: '30:15'
  },
  {
    id: 4,
    title: 'Texturing & Shading untuk Pemula',
    description: 'Berikan warna dan kehidupan pada model 3D Anda. Pelajari dasar-dasar UV unwrapping, texturing, dan pembuatan material (shader) yang realistis.',
    videoId: 'B0J2_sRq_pA',
    duration: '22:45'
  },
];

const EdukasiPage = () => {
  // State untuk menyimpan modul yang sedang diputar
  const [selectedModule, setSelectedModule] = useState<Module>(learningModules[0]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <FaBlender className="text-5xl text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a2540]">Pusat Edukasi 3D</h1>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Tingkatkan keterampilan Anda dengan modul pembelajaran gratis. Mulai dari dasar hingga mahir, semua tersedia di sini untuk mendukung kemandirian talenta rekayasa Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kolom Kiri: Pemutar Video & Deskripsi */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              {/* PERUBAHAN DI SINI */}
              <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedModule.videoId}`}
                  title={selectedModule.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedModule.title}</h2>
              <p className="text-slate-600 mt-2">{selectedModule.description}</p>
            </div>

            {/* Kolom Kanan: Daftar Putar (Playlist) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-slate-700 border-b pb-3 mb-4">Daftar Modul</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {learningModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-4 ${
                      selectedModule.id === module.id
                        ? 'bg-indigo-100 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-indigo-500 mt-1">
                      <FaPlayCircle size={20} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${selectedModule.id === module.id ? 'text-indigo-800' : 'text-slate-800'}`}>{module.title}</h4>
                      <p className="text-xs text-slate-500">{module.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EdukasiPage;