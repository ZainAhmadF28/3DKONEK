'use client';

import React from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ src, alt }) => {
  return (
    <div className="w-full h-96 md:h-[60vh] border rounded-lg overflow-hidden bg-slate-100">
      <model-viewer
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        ar
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
      ></model-viewer>
    </div>
  );
};

export default ModelViewer;