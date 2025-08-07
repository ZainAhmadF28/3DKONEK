'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import ModelViewer from './ModelViewer';

interface ThreeDViewerModalProps {
  src: string;
  onClose: () => void;
}

const ThreeDViewerModal: React.FC<ThreeDViewerModalProps> = ({ src, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl z-10"
          onClick={onClose}
          aria-label="Tutup penampil 3D"
        >
          <FaTimes />
        </button>
        <ModelViewer src={src} alt="3D Model Submission" />
      </div>
    </div>
  );
};

export default ThreeDViewerModal;