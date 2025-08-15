'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as THREE from 'three';
import { FaTasks, FaComments, FaBook, FaMapMarkedAlt, FaBoxOpen, FaStar, FaBolt, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import ModelViewer from './ModelViewer';

interface LandingStats {
  stats: {
    assets: number;
    designers: number;
    challenges: number;
    tutorials: number;
  };
  previewData: {
    assets: Array<{ 
      id: number;
      name: string; 
      category: string; 
      price: string; 
      posterUrl: string | null;
      fileUrl: string;
      description: string | null;
    }>;
    designers: Array<{ name: string; project: string; status: string; }>;
    challenges: Array<{ title: string; reward: string; deadline: string; participants: number; }>;
    tutorials: Array<{ title: string; level: string; duration: string; rating: number; videoId?: string; }>;
  };
}

const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap');
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .glass-card { 
      background: rgba(31, 41, 55, 0.4); 
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px); 
      border: 1px solid rgba(255,255,255,0.1); 
    }
    .glass-card-light { 
      background: rgba(255, 255, 255, 0.8); 
      backdrop-filter: blur(12px); 
      -webkit-backdrop-filter: blur(12px); 
      border: 1px solid rgba(0,0,0,0.1); 
    }
    .lime-glow { box-shadow: 0 0 15px rgba(158,255,0,0.4), 0 0 5px rgba(158,255,0,0.6); }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 300px;
      }
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out forwards;
    }
    .green-glow { box-shadow: 0 0 15px rgba(34,197,94,0.4), 0 0 5px rgba(34,197,94,0.6); }
    .blue-glow { box-shadow: 0 0 15px rgba(59,130,246,0.4), 0 0 5px rgba(59,130,246,0.6); }
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

const Hero = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [landingData, setLandingData] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const response = await fetch('/api/landing/stats');
        if (response.ok) {
          const data = await response.json();
          setLandingData(data);
        }
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Fallback data if API fails
  const fallbackData = {
    stats: { assets: 0, designers: 0, challenges: 0, tutorials: 0 },
    previewData: {
      assets: [],
      designers: [],
      challenges: [],
      tutorials: []
    }
  };

  const data = landingData || fallbackData;

  // Auto-rotate assets every 5 seconds when on assets tab
  useEffect(() => {
    if (activeTab === 0 && data.previewData.assets.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentAssetIndex((prev) => 
          prev === data.previewData.assets.length - 1 ? 0 : prev + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeTab, data.previewData.assets.length, isPaused]);
  
  const tabs = [
    {
      title: "Temukan Assets 3D",
      subtitle: "Ribuan model berkualitas",
      description: "Jelajahi perpustakaan model 3D dari desainer terbaik Indonesia",
      icon: <FaBoxOpen />,
      stats: `${data.stats.assets} Assets`,
      data: data.previewData.assets
    },
    {
      title: "Kolaborasi Desainer",
      subtitle: "Komunitas kreatif",
      description: "Terhubung dengan ribuan desainer 3D dan kerjakan proyek bersama",
      icon: <FaComments />,
      stats: `${data.stats.designers} Desainer`,
      data: data.previewData.designers
    },
    {
      title: "Tantangan Desain",
      subtitle: "Proyek nyata berhadiah",
      description: "Ambil tantangan dari industri dan dapatkan pengalaman plus reward",
      icon: <FaTasks />,
      stats: `${data.stats.challenges} Tantangan Aktif`,
      data: data.previewData.challenges
    },
    {
      title: "Pelajari Desain 3D",
      subtitle: "Materi pembelajaran lengkap",
      description: "Akses tutorial, course, dan materi dari para ahli desain 3D",
      icon: <FaBook />,
      stats: `${data.stats.tutorials} Tutorial`,
      data: data.previewData.tutorials
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-400';
      case 'Busy': return 'bg-red-400';
      case 'Away': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation functions for asset carousel
  const nextAsset = () => {
    if (data.previewData.assets.length > 0) {
      setCurrentAssetIndex((prev) => 
        prev === data.previewData.assets.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevAsset = () => {
    if (data.previewData.assets.length > 0) {
      setCurrentAssetIndex((prev) => 
        prev === 0 ? data.previewData.assets.length - 1 : prev - 1
      );
    }
  };

  const currentAsset = data.previewData.assets[currentAssetIndex];
  
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 mt-8">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-6 text-slate-900 dark:text-gray-100">
              3D<span className={`${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`}>KONEK</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-2xl lg:max-w-none mx-auto lg:mx-0">
              Platform Koneksi dan Edukasi Desain 3D untuk Semua Kalangan. Belajar, berkolaborasi, dan berkarya di dunia desain 3D. Terhubung dengan komunitas, akses tantangan, dan kembangkan kemampuan Anda.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <Link href="/register" className={`${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 blue-glow text-white' : 'bg-lime-400 hover:bg-lime-300 lime-glow text-gray-900'} font-bold py-3 px-8 rounded-full flex items-center transition-transform duration-300 hover:scale-105`}>
                <FaBolt className="mr-2" /> Mulai Sekarang
              </Link>
              <Link href="#fitur" className={`${theme === 'light' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : 'border-lime-400 text-lime-400 hover:bg-lime-400/10'} border-2 font-bold py-3 px-8 rounded-full transition-all duration-300`}>
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          {/* Right Column - Interactive Feature Showcase */}
          <div className={`${theme === 'light' ? 'glass-card-light' : 'glass-card'} p-8 rounded-3xl`}>
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'light' ? 'border-blue-600' : 'border-lime-400'}`}></div>
              </div>
            ) : (
              <>
                {/* Tab Navigation with Dots */}
                <div className="flex justify-center gap-4 mb-8">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 group ${
                        activeTab === index 
                          ? theme === 'light' 
                            ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                            : 'bg-lime-400 text-gray-900 scale-110 shadow-lg shadow-lime-400/30'
                          : theme === 'light'
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      
                      {/* Tooltip */}
                      <div className={`absolute -top-16 left-1/2 transform -translate-x-1/2 px-3 py-2 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap ${
                        theme === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-200'
                      }`}>
                        {tab.title}
                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                          theme === 'light' ? 'border-t-gray-900' : 'border-t-gray-800'
                        }`}></div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Tab Content */}
                <div className="min-h-[350px]">
                  <div className="text-center mb-6">
                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {tabs[activeTab].title}
                    </h3>
                    <p className={`text-sm font-medium mb-1 ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`}>
                      {tabs[activeTab].subtitle}
                    </p>
                    <p className="text-slate-600 dark:text-gray-300 mb-4">
                      {tabs[activeTab].description}
                    </p>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-lime-400/20 text-lime-400'
                    }`}>
                      {tabs[activeTab].stats}
                    </div>
                  </div>

                  {/* Dynamic Content Based on Active Tab */}
                  <div className="space-y-3">
                    {activeTab === 0 && (
                      <div className="space-y-4">
                        {data.previewData.assets.length > 0 ? (
                          <>
                            {/* 3D Model Viewer */}
                            <div 
                              className="relative"
                              onMouseEnter={() => setIsPaused(true)}
                              onMouseLeave={() => setIsPaused(false)}
                            >
                              <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <ModelViewer
                                  src={currentAsset.fileUrl}
                                  alt={currentAsset.name}
                                />
                              </div>
                              
                              {/* Auto-play indicator */}
                              {data.previewData.assets.length > 1 && (
                                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                                  theme === 'light' ? 'bg-white/80 text-gray-700' : 'bg-gray-800/80 text-gray-300'
                                } ${isPaused ? 'opacity-50' : ''}`}>
                                  {isPaused ? '⏸️' : '▶️'} Auto
                                </div>
                              )}

                              {/* Navigation Controls */}
                              {data.previewData.assets.length > 1 && (
                                <>
                                  <button
                                    onClick={prevAsset}
                                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full ${
                                      theme === 'light' 
                                        ? 'bg-white/80 hover:bg-white text-gray-700' 
                                        : 'bg-gray-800/80 hover:bg-gray-800 text-gray-300'
                                    } flex items-center justify-center transition-all hover:scale-110 shadow-lg`}
                                  >
                                    <FaChevronLeft className="text-sm" />
                                  </button>
                                  <button
                                    onClick={nextAsset}
                                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full ${
                                      theme === 'light' 
                                        ? 'bg-white/80 hover:bg-white text-gray-700' 
                                        : 'bg-gray-800/80 hover:bg-gray-800 text-gray-300'
                                    } flex items-center justify-center transition-all hover:scale-110 shadow-lg`}
                                  >
                                    <FaChevronRight className="text-sm" />
                                  </button>
                                </>
                              )}

                              {/* Asset Information Overlay */}
                              <div className={`absolute bottom-0 left-0 right-0 ${theme === 'light' ? 'bg-white/90' : 'bg-gray-900/90'} backdrop-blur-sm p-4 rounded-b-xl`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${theme === 'light' ? 'bg-blue-100' : 'bg-lime-400/20'} flex items-center justify-center overflow-hidden`}>
                                      {currentAsset.posterUrl ? (
                                        <Image 
                                          src={currentAsset.posterUrl} 
                                          alt={currentAsset.name} 
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-cover rounded-lg" 
                                        />
                                      ) : (
                                        <FaBoxOpen className={`${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} text-sm`} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{currentAsset.name}</p>
                                      <p className="text-xs text-slate-500 dark:text-gray-400">{currentAsset.category}</p>
                                    </div>
                                  </div>
                                  <span className={`text-sm font-bold ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`}>
                                    {currentAsset.price === 'Gratis' ? 'Gratis' : `Rp ${currentAsset.price}`}
                                  </span>
                                </div>

                                {/* Asset Navigation Dots */}
                                {data.previewData.assets.length > 1 && (
                                  <div className="flex justify-center gap-2 mt-3">
                                    {data.previewData.assets.map((_, index) => (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentAssetIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                          index === currentAssetIndex
                                            ? theme === 'light' ? 'bg-blue-600' : 'bg-lime-400'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => setSelectedModel(currentAsset.fileUrl)}
                                className={`flex-1 text-sm px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-semibold transition-colors duration-300 flex items-center justify-center gap-2`}
                              >
                                <FaBoxOpen />
                                Fullscreen
                              </button>
                              <Link
                                href="/perpustakaan"
                                className={`flex-1 text-sm px-4 py-2 rounded-lg ${theme === 'light' ? 'border border-blue-600 text-blue-600 hover:bg-blue-50' : 'border border-lime-400 text-lime-400 hover:bg-lime-400/10'} font-semibold transition-colors duration-300 text-center`}
                              >
                                Lihat Semua Asset
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                            Belum ada data asset tersedia
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="space-y-3">
                        {data.previewData.designers.length > 0 ? (
                          data.previewData.designers.map((designer, i) => (
                            <div key={i} className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800/50'} flex items-center gap-4`}>
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {designer.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(designer.status)} rounded-full border-2 ${theme === 'light' ? 'border-white' : 'border-gray-800'}`}></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{designer.name}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{designer.project}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                designer.status === 'Online' ? 'bg-green-100 text-green-800' :
                                designer.status === 'Busy' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {designer.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                            Belum ada desainer terdaftar
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="space-y-3">
                        {data.previewData.challenges.length > 0 ? (
                          data.previewData.challenges.map((challenge, i) => (
                            <div key={i} className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800/50'} space-y-2`}>
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{challenge.title}</h4>
                                <span className="text-green-600 font-bold text-sm">Rp {challenge.reward}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                                <span>📅 {challenge.deadline}</span>
                                <span>👥 {challenge.participants} peserta</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-blue-600' : 'bg-lime-400'}`} 
                                     style={{ width: `${Math.min(challenge.participants * 3, 100)}%` }}></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                            Belum ada tantangan aktif
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 3 && (
                      <div className="space-y-3 relative">
                        {data.previewData.tutorials.length > 0 ? (
                          data.previewData.tutorials.map((course, i) => (
                            <div 
                              key={i} 
                              className="space-y-2"
                              onMouseEnter={() => setHoveredVideo(course.videoId || null)}
                              onMouseLeave={() => setHoveredVideo(null)}
                            >
                              {/* Tutorial Card */}
                              <div 
                                className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-800/50 hover:bg-gray-700/50'} space-y-2 transition-all duration-300 cursor-pointer relative group`}
                              >
                                {/* Original Content */}
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-lime-400 transition-colors duration-300">{course.title}</h4>
                                  <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-500 text-xs" />
                                    <span className="text-xs text-slate-600 dark:text-gray-400">{course.rating}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                                    {course.level}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-gray-400">⏱️ {course.duration}</span>
                                </div>
                                
                                {/* Hover Indicator */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className={`w-6 h-6 ${theme === 'light' ? 'bg-blue-600' : 'bg-lime-400'} rounded-full flex items-center justify-center`}>
                                    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Video Player - Muncul di bawah card */}
                              {hoveredVideo === course.videoId && course.videoId && (
                                <div className="overflow-hidden rounded-xl animate-slideDown">
                                  <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} p-3 rounded-xl`}>
                                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                                      <iframe
                                        src={`https://www.youtube.com/embed/${course.videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                                        title={course.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-slate-600 dark:text-gray-400">Hover untuk preview video tutorial</p>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHoveredVideo(null);
                                        }}
                                        className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'} transition-colors`}
                                      >
                                        Tutup
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                            Belum ada tutorial tersedia
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Model Viewer Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preview Model 3D</h3>
              <button
                onClick={() => setSelectedModel(null)}
                className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}
              >
                <FaTimes className="text-slate-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="h-96 relative">
              {/* Model Viewer Component */}
              <ModelViewer
                src={selectedModel}
                alt="3D Model Preview"
              />
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 dark:text-gray-400 mb-4">
                Gunakan mouse untuk memutar dan zoom model 3D
              </p>
              <Link
                href="/perpustakaan"
                className={`inline-block ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-lime-400 hover:bg-lime-300 text-gray-900'} font-bold py-3 px-6 rounded-lg transition-all`}
              >
                Lihat Detail di Perpustakaan
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Problems = () => {
  const { theme } = useTheme();
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
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-gray-100">Menjawab Masalah Nyata</h2>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">Kami hadir untuk memutus rantai masalah yang menghambat kemandirian industri nasional.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((p, i) => (
            <div key={i} className={`${theme === 'light' ? 'glass-card-light border-blue-500' : 'glass-card border-lime-400'} p-8 rounded-2xl border-t-2 transform hover:-translate-y-2 transition-transform duration-300`}>
              <div className={`text-4xl ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} mb-5 inline-block`}>{p.icon}</div>
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">{p.title}</h3>
              <p className="text-slate-600 dark:text-gray-300">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Workflow = () => {
  const { theme } = useTheme();
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
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-gray-100">Alur Kerja Kolaboratif</h2>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">Dari masalah menjadi solusi dalam 4 langkah.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative p-6">
              <div className="flex items-center mb-4">
                <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full ${theme === 'light' ? 'bg-blue-600 blue-glow text-white' : 'bg-lime-400 lime-glow text-gray-900'} font-bold text-xl`}>{s.step}</div>
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-gray-700 ml-4 hidden md:block"></div>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-slate-600 dark:text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { theme } = useTheme();
  const features = [
    { icon: <FaTasks />, title: 'Tantangan & Imbalan', desc: 'Brief industri nyata + reputasi.' },
    { icon: <FaComments />, title: 'Komunitas Kolaboratif', desc: 'Diskusi, berbagi file, jaringan.' },
    { icon: <FaBook />, title: 'Pustaka Desain 3D', desc: 'Akses model & materi belajar.' },
    { icon: <FaMapMarkedAlt />, title: 'Galeri & Portofolio', desc: 'Pamerkan karya terbaik.' },
    { icon: <FaBoxOpen />, title: 'Aset Siap Pakai', desc: 'Percepat proses kreatif.' },
    { icon: <FaStar />, title: 'Personalisasi Konten', desc: 'Rekomendasi sesuai minat.' },
  ];
  return (
    <section id="fitur" className="py-20 sm:py-32 bg-slate-100 dark:bg-gray-900/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-gray-100">Ekosistem Lengkap</h2>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">Untuk belajar, berkolaborasi, dan bertumbuh.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className={`${theme === 'light' ? 'glass-card-light' : 'glass-card'} p-8 rounded-2xl transform hover:-translate-y-2 transition-transform duration-300 text-center`}>
              <div className={`text-5xl ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'} mb-6 inline-block`}>{f.icon}</div>
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-slate-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const { theme } = useTheme();
  
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-gray-100">Siap Menciptakan Dampak?</h2>
        <p className="text-lg text-slate-600 dark:text-gray-300 mb-10">Bergabunglah dengan talenta rekayasa lainnya. Daftar sekarang, gratis.</p>
        <Link href="/register" className={`inline-block ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 blue-glow text-white' : 'bg-lime-400 hover:bg-lime-300 lime-glow text-gray-900'} font-bold py-4 px-10 rounded-full text-lg transition-transform duration-300 hover:scale-105`}>
          Daftar Sekarang
        </Link>
      </div>
    </section>
  );
};

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


