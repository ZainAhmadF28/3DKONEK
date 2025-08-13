'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaPlayCircle, FaBlender } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

// Tipe data untuk setiap modul pembelajaran
interface Module {
  id: number;
  title: string;
  description: string;
  videoId: string; // ID video dari URL YouTube
  duration: string;
}

// PERBARUAN: Daftar modul diperbanyak dan link video telah diperbaiki
const learningModules: Module[] = [
  {
    id: 1,
    title: 'Membuat Donat 3D di Blender - Tutorial Pemula',
    description: 'Tutorial Blender paling fundamental untuk pemula. Pelajari dasar-dasar navigasi, modeling, dan material dengan membuat donat ikonik dari Blender Guru.',
    videoId: 'fBsQZfAvwts',
    duration: '23:36'
  },
  {
    id: 2,
    title: 'Tutorial Membuat Pedang Low Poly',
    description: 'Ciptakan aset game pertamamu! Pelajari teknik modeling low poly yang efisien untuk membuat sebuah pedang yang keren dan siap pakai.',
    videoId: 'QHS45FPdQrA',
    duration: '11:27'
  },
  {
    id: 3,
    title: 'Cara Membuat Karakter 3D di Blender (Part 1)',
    description: 'Panduan lengkap membuat karakter manusia dari awal. Pelajari proporsi, modeling wajah, dan tubuh untuk karakter stylize.',
    videoId: '8t5Mymu5Q0A',
    duration: '23:25'
  },
  {
    id: 4,
    title: 'Tutorial Sculpting Karakter Sederhana',
    description: 'Masuki dunia sculpting digital. Pahami brush dasar dan teknik memahat untuk menciptakan bentuk organik sederhana seperti karakter fantasi.',
    videoId: 'mHkw90E5w4o',
    duration: '20:29'
  },
  {
    id: 5,
    title: 'Tutorial Texturing di Blender',
    description: 'Berikan kehidupan pada model Anda. Pelajari cara membuka UV Map dan menerapkan tekstur gambar pada objek 3D Anda secara presisi.',
    videoId: 'Nq3n-s5aA_E',
    duration: '22:50'
  },
  {
    id: 6,
    title: 'Tutorial Rigging Karakter di Blender',
    description: 'Buat karakter Anda bisa bergerak! Pelajari cara membuat tulang (armature) dan menghubungkannya ke model untuk persiapan animasi.',
    videoId: 'tL7vBFnJd5s',
    duration: '27:32'
  },
  {
    id: 7,
    title: 'Tutorial Animasi Dasar di Blender',
    description: 'Pahami dasar-dasar animasi. Pelajari tentang keyframe, timeline, dan graph editor untuk membuat objek Anda bergerak dengan mulus.',
    videoId: 'pGuA9oR3FmI',
    duration: '15:58'
  },
  {
    id: 8,
    title: 'Tutorial 3 Point Lighting di Blender',
    description: 'Cahaya adalah segalanya. Pelajari teknik pencahayaan tiga titik (three-point lighting) untuk membuat render Anda terlihat profesional dan dramatis.',
    videoId: 'm4A0h0Ld-aA',
    duration: '08:31'
  },
  {
    id: 9,
    title: 'Setting Render Cepat di Cycles dan Eevee',
    description: 'Optimalkan waktu render Anda. Pelajari perbedaan antara render engine Cycles dan Eevee serta cara mendapatkan hasil terbaik dengan cepat.',
    videoId: '_fAg-zQ7_pY',
    duration: '13:01'
  },
  {
    id: 10,
    title: 'Dasar-Dasar Geometry Nodes di Blender',
    description: 'Jelajahi masa depan modeling prosedural. Pahami konsep dasar Geometry Nodes untuk membuat objek kompleks dengan logika non-destruktif.',
    videoId: 'a3T4gL4zY3Y',
    duration: '20:41'
  },
];

const EdukasiPage = () => {
  // State untuk menyimpan modul yang sedang diputar
  const [selectedModule, setSelectedModule] = useState<Module>(learningModules[0]);
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-gray-50' : 'bg-gray-50 text-gray-900'} min-h-screen flex flex-col transition-colors duration-300`}>
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <FaBlender className={`text-5xl ${theme === 'dark' ? 'text-lime-400' : 'text-blue-500'} mx-auto mb-4`} />
            <h1 className={`font-display text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pusat Edukasi 3D</h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-3xl mx-auto`}>
              Tingkatkan keterampilan Anda dengan modul pembelajaran gratis untuk mendukung kemandirian talenta rekayasa Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Kolom Kiri: Pemutar Video & Deskripsi */}
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  key={selectedModule.id} // Re-render iframe saat video berubah
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedModule.videoId}?autoplay=1&color=white`}
                  title={selectedModule.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className={`${theme === 'dark' ? 'glass-card' : 'bg-white border border-gray-200 shadow-lg'} p-6 rounded-2xl`}>
                <h2 className={`font-display text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedModule.title}</h2>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-2 leading-relaxed`}>{selectedModule.description}</p>
              </div>
            </div>

            {/* Kolom Kanan: Daftar Putar (Playlist) */}
            <div className="lg:col-span-1">
              <div className={`${theme === 'dark' ? 'glass-card' : 'bg-white border border-gray-200 shadow-lg'} p-6 rounded-2xl h-full`}>
                <h3 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'} border-b pb-3 mb-4`}>Daftar Modul</h3>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {learningModules.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full text-left p-4 rounded-lg transition-colors flex items-center gap-4 ${
                        selectedModule.id === module.id
                          ? (theme === 'dark' ? 'bg-lime-400/20' : 'bg-blue-50')
                          : (theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                      }`}
                    >
                      <div className={`font-display text-lg font-bold ${
                        selectedModule.id === module.id 
                          ? (theme === 'dark' ? 'text-lime-400' : 'text-blue-600') 
                          : (theme === 'dark' ? 'text-gray-500' : 'text-gray-400')
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-grow">
                        <h4 className={`font-semibold ${
                          selectedModule.id === module.id 
                            ? (theme === 'dark' ? 'text-white' : 'text-gray-900') 
                            : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')
                        }`}>{module.title}</h4>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{module.duration}</p>
                      </div>
                      {selectedModule.id === module.id && (
                        <FaPlayCircle className={`${theme === 'dark' ? 'text-lime-400' : 'text-blue-600'} text-xl flex-shrink-0`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
            .glass-card {
                background: rgba(31, 41, 55, 0.4);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .font-display {
                font-family: 'Space Grotesk', sans-serif;
            }
            body {
                font-family: 'Inter', sans-serif;
            }
        `}</style>
    </div>
  );
};

export default EdukasiPage;
