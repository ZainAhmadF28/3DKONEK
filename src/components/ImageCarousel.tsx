'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';

interface ImageCarouselProps {
  images: { url: string }[];
  onImageClick: (imageUrl: string) => void; // Prop baru untuk menangani klik
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah lightbox terbuka saat tombol navigasi diklik
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-80 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-500">
        Tidak Ada Gambar
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-80 rounded-t-lg overflow-hidden group cursor-pointer"
      // Tambahkan onClick di sini untuk membuka lightbox
      onClick={() => onImageClick(images[currentIndex].url)}
    >
      <Image
        src={images[currentIndex].url}
        alt={`Gambar tantangan ${currentIndex + 1}`}
        layout="fill"
        objectFit="cover"
        className="transition-opacity duration-500 ease-in-out"
      />
      
      {/* Ikon "Lihat Penuh" */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex justify-center items-center text-white text-xl font-bold opacity-0 group-hover:opacity-100">
        <FaExpand size={32} />
      </div>

      {/* Tombol Kiri */}
      {images.length > 1 && (
        <button 
          onClick={goToPrevious} 
          className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-opacity-50 transition-all z-10"
          aria-label="Gambar sebelumnya"
        >
          <FaChevronLeft size={24} />
        </button>
      )}
      {/* Tombol Kanan */}
      {images.length > 1 && (
        <button 
          onClick={goToNext} 
          className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-opacity-50 transition-all z-10"
          aria-label="Gambar berikutnya"
        >
          <FaChevronRight size={24} />
        </button>
      )}
      {/* Indikator Titik */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
            onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
