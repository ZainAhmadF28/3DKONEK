'use client';

import React, { useState } from 'react';

interface HoverModelViewerProps {
  src: string;
  alt: string;
  posterUrl?: string | null;
}

const HoverModelViewer: React.FC<HoverModelViewerProps> = ({ src, alt, posterUrl }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="w-full h-64 md:h-60 border rounded-lg overflow-hidden bg-slate-100 relative"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {isActive ? (
        <model-viewer
          src={src}
          alt={alt}
          camera-controls
          auto-rotate
          ar
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        ></model-viewer>
      ) : (
        <button
          type="button"
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          onClick={() => setIsActive(true)}
          aria-label="Aktifkan pratinjau 3D"
        >
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-500">
              <div className="text-sm">Arahkan kursor atau klik untuk melihat model</div>
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default HoverModelViewer;


