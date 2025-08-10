'use client';

import { useEffect } from 'react';

const CaptureMode = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const enable = params.get('capture') === '1' || params.get('fullpage') === '1';
    if (!enable) return;
    document.body.classList.add('capture-mode');
    return () => {
      document.body.classList.remove('capture-mode');
    };
  }, []);
  return null;
};

export default CaptureMode;


