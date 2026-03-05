'use client';

import React, { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaTimes, FaSearch, FaSpinner, FaBoxOpen } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: string;
  posterUrl: string | null;
  fileUrl: string;
  author: {
    name: string;
  };
}

interface ImageSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSearchResults([]);
      setAnalysis('');
    }
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/search/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
        setAnalysis(data.analysis);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setSearchResults([]);
    setAnalysis('');
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSearchResults([]);
      setAnalysis('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-100' : 'bg-lime-400/20'}`}>
              <FaCamera className={`${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pencarian Visual</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">Cari asset 3D berdasarkan gambar</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}
          >
            <FaTimes className="text-slate-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Image Upload Area */}
          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                theme === 'light' 
                  ? 'border-gray-300 hover:border-blue-400 bg-gray-50' 
                  : 'border-gray-600 hover:border-lime-400 bg-gray-700/50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className={`text-6xl mb-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                📷
              </div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Upload Gambar untuk Pencarian
              </h4>
              <p className="text-slate-600 dark:text-gray-400 mb-6">
                Drag & drop gambar atau pilih dari perangkat Anda
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                    theme === 'light' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-lime-400 hover:bg-lime-300 text-gray-900'
                  } transition-colors`}
                >
                  <FaUpload />
                  Pilih Gambar
                </button>
                
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 ${
                    theme === 'light' 
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                      : 'border-lime-400 text-lime-400 hover:bg-lime-400/10'
                  } transition-colors`}
                >
                  <FaCamera />
                  Ambil Foto
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-gray-500 mt-4">
                Mendukung JPG, PNG, WebP (max 5MB)
              </p>
            </div>
          ) : (
            /* Selected Image and Search Results */
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3">
                  <div className="relative">
                    <Image
                      src={previewUrl!}
                      alt="Selected image"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                        setSearchResults([]);
                        setAnalysis('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleImageSearch}
                    disabled={isLoading}
                    className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold ${
                      theme === 'light' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400' 
                        : 'bg-lime-400 hover:bg-lime-300 text-gray-900 disabled:bg-lime-600'
                    } transition-colors disabled:cursor-not-allowed`}
                  >
                    {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    {isLoading ? 'Mencari...' : 'Cari Asset Serupa'}
                  </button>

                  {analysis && (
                    <div className={`mt-4 p-3 rounded-lg ${theme === 'light' ? 'bg-blue-50' : 'bg-gray-700'}`}>
                      <p className="text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                        Kata kunci terdeteksi:
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        {analysis}
                      </p>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <div className="lg:w-2/3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <FaSpinner className={`animate-spin text-4xl mb-4 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`} />
                        <p className="text-slate-600 dark:text-gray-400">
                          Sedang menganalisis gambar dan mencari asset...
                        </p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Hasil Pencarian ({searchResults.length} asset ditemukan)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {searchResults.map((asset) => (
                          <Link
                            key={asset.id}
                            href={`/perpustakaan?search=${asset.name}`}
                            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                              theme === 'light' 
                                ? 'bg-white border-gray-200 hover:border-blue-400' 
                                : 'bg-gray-700 border-gray-600 hover:border-lime-400'
                            }`}
                            onClick={handleClose}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                                {asset.posterUrl ? (
                                  <Image
                                    src={asset.posterUrl}
                                    alt={asset.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaBoxOpen className="text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                  {asset.name}
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                  {asset.category} • {asset.author.name}
                                </p>
                                <p className={`text-xs font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-lime-400'}`}>
                                  {asset.price === '0' ? 'Gratis' : `Rp ${(parseInt(asset.price) / 1000).toFixed(0)}K`}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-slate-600 dark:text-gray-400">
                        Tidak ditemukan asset yang serupa dengan gambar ini.
                      </p>
                      <p className="text-sm text-slate-500 dark:text-gray-500 mt-2">
                        Coba dengan gambar yang berbeda atau gunakan pencarian teks.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageSearch;
