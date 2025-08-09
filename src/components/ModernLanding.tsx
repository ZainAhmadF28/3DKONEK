'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { FaTasks, FaComments, FaBook, FaMapMarkedAlt, FaBoxOpen, FaStar, FaUserPlus, FaBolt } from 'react-icons/fa';

const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #111827; color: #F9FAFB; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .glass-card { background: rgba(31, 41, 55, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
    .lime-glow { box-shadow: 0 0 15px rgba(158,255,0,0.4), 0 0 5px rgba(158,255,0,0.6); }
  `}</style>
);

const ThreeJSCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(2, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x9EFF00, metalness: 0.7, roughness: 0.4 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1.5); pointLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(pointLight, ambientLight);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.001;
      mesh.rotation.y += 0.002;
      mesh.rotation.y += (mouseX * 0.5 - mesh.rotation.y) * 0.05;
      mesh.rotation.x += (mouseY * 0.5 - mesh.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.2 }} />;
};

const Hero = () => (
  <section className="min-h-screen flex items-center justify-center text-center pt-20">
    <div className="relative z-10 max-w-4xl mx-auto px-4">
      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-6">
        Rekayasa Masa Depan, <span className="text-lime-400">Bersama</span>.
      </h1>
      <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-10">
        Platform kolaborasi untuk talenta rekayasa Indonesia. Selesaikan tantangan industri nyata, bangun portofolio, dan ciptakan dampak.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="#fitur" className="bg-lime-400 text-gray-900 font-bold py-3 px-8 rounded-full flex items-center transition-transform duration-300 hover:scale-105 lime-glow">
          <FaBolt className="mr-2" /> Mulai Menjelajah
        </Link>
      </div>
    </div>
  </section>
);

const Problems = () => {
  const data = [
    { icon: '⚙️', title: 'Ketergantungan Impor', desc: 'Suku cadang mahal & lama.' },
    { icon: '🏭', title: 'Kuburan Mesin', desc: 'Mesin mangkrak karena satu komponen.' },
    { icon: '🧠', title: 'Kesenjangan Talenta', desc: 'Talenta tak terhubung masalah nyata.' },
    { icon: '💎', title: 'Potensi Terpendam', desc: 'UKM manufaktur belum tergali.' },
  ];
  return (
    <section id="masalah" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Menjawab Masalah Nyata</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Kami hadir untuk memutus rantai masalah yang menghambat kemandirian industri nasional.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((p, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl border-t-2 border-lime-400 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl text-lime-400 mb-5 inline-block">{p.icon}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">{p.title}</h3>
              <p className="text-gray-300">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Workflow = () => {
  const steps = [
    { step: '1', title: 'Publikasi Tantangan', desc: 'Industri mengunggah detail & imbalan.' },
    { step: '2', title: 'Kolaborasi Terbuka', desc: 'Talenta berkolaborasi membuat solusi.' },
    { step: '3', title: 'Produksi Lokal', desc: 'Desain diproduksi manufaktur lokal.' },
    { step: '4', title: 'Aset Digital Nasional', desc: 'Desain tersimpan di pustaka nasional.' },
  ];
  return (
    <section id="cara-kerja" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Alur Kerja Kolaboratif</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Dari masalah menjadi solusi dalam 4 langkah.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative p-6">
              <div className="flex items-center mb-4">
                <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-lime-400 text-gray-900 font-bold text-xl lime-glow">{s.step}</div>
                <div className="flex-1 h-0.5 bg-gray-700 ml-4 hidden md:block"></div>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <FaTasks />, title: 'Tantangan & Imbalan', desc: 'Brief industri nyata + reputasi.' },
    { icon: <FaComments />, title: 'Komunitas Kolaboratif', desc: 'Diskusi, berbagi file, jaringan.' },
    { icon: <FaBook />, title: 'Pustaka Desain 3D', desc: 'Akses model & materi belajar.' },
    { icon: <FaMapMarkedAlt />, title: 'Galeri & Portofolio', desc: 'Pamerkan karya terbaik.' },
    { icon: <FaBoxOpen />, title: 'Aset Siap Pakai', desc: 'Percepat proses kreatif.' },
    { icon: <FaStar />, title: 'Personalisasi Konten', desc: 'Rekomendasi sesuai minat.' },
  ];
  return (
    <section id="fitur" className="py-20 sm:py-32 bg-gray-900/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ekosistem Lengkap</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Untuk belajar, berkolaborasi, dan bertumbuh.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl transform hover:-translate-y-2 transition-transform duration-300 text-center">
              <div className="text-5xl text-lime-400 mb-6 inline-block">{f.icon}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20 sm:py-32">
    <div className="max-w-3xl mx-auto text-center px-4">
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Siap Menciptakan Dampak?</h2>
      <p className="text-lg text-gray-300 mb-10">Bergabunglah dengan talenta rekayasa lainnya. Daftar sekarang, gratis.</p>
      <Link href="/register" className="inline-block bg-lime-400 text-gray-900 font-bold py-4 px-10 rounded-full text-lg hover:bg-lime-300 transition-transform duration-300 hover:scale-105 lime-glow">
        Daftar Sekarang
      </Link>
    </div>
  </section>
);

const ModernLanding = () => {
  return (
    <div className="relative">
      <GlobalStyles />
      <ThreeJSCanvas />
      <main>
        <Hero />
        <Problems />
        <Workflow />
        <Features />
        <CTA />
      </main>
    </div>
  );
};

export default ModernLanding;


