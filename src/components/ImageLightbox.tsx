'use client';

import React from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  return (
    // Backdrop / Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4 animate-fade-in"
      onClick={onClose} // Menutup saat backdrop diklik
    >
      {/* Tombol Tutup di Pojok */}
      <button
        className="absolute top-4 right-4 text-white text-3xl hover:opacity-80 transition-opacity"
        onClick={onClose}
      >
        <FaTimes />
      </button>

      {/* Kontainer Gambar */}
      <div
        className="relative w-full h-full max-w-4xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat gambar diklik
      >
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="contain" // 'contain' memastikan seluruh gambar terlihat
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
