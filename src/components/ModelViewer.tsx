'use client';

import React from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ src, alt }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <model-viewer
        src={src}
        alt={alt}
        camera-controls
        auto-rotate
        ar
        shadow-intensity="1"
        camera-orbit="0deg 75deg 105%"
        field-of-view="30deg"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        style={{ width: '100%', height: '100%' }}
      ></model-viewer>
    </div>
  );
};

export default ModelViewer;