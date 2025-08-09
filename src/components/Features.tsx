// src/components/Features.tsx
import React from 'react';
import { FaTasks, FaComments, FaBook, FaMapMarkedAlt, FaBoxOpen, FaStar } from 'react-icons/fa';

const featureData = [
    { icon: <FaTasks />, title: "Tantangan Desain 3D & Imbalan", description: "Ikuti tantangan desain 3D, selesaikan brief, dan raih poin maupun imbalan." },
    { icon: <FaComments />, title: "Kolaborasi & Komunitas", description: "Diskusi, berbagi file 3D, dan bangun jaringan dengan desainer lain." },
    { icon: <FaBook />, title: "Pustaka & Edukasi 3D", description: "Akses model, referensi, dan materi belajar desain 3D terbaru." },
    { icon: <FaMapMarkedAlt />, title: "Galeri & Portofolio", description: "Pamerkan karya terbaik untuk meningkatkan eksposur dan reputasi." },
    { icon: <FaBoxOpen />, title: "Asset & Resource", description: "Temukan aset siap pakai untuk mempercepat proses kreatif Anda." },
    { icon: <FaStar />, title: "Rekomendasi Personal", description: "Konten dipersonalisasi berdasarkan minat kategori yang Anda pilih." }
];

const Features = () => {
    return (
        <section id="fitur" className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-extrabold text-[#0a2540] mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    Fitur Utama Platform
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#0052cc] to-[#00c6ff] mx-auto mb-16"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featureData.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                            <div className="text-5xl text-[#0052cc] hover:text-[#ff6b35] mb-6 inline-block transition-colors duration-300">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-[#0a2540] mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;