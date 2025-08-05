'use client';

import { useEffect } from 'react';

export default function DeferredCSS() {
  useEffect(() => {
    // Load non-critical CSS after component mounts
    const loadDeferredCSS = () => {
      // Load print styles dynamically by creating a link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/print.css';
      link.media = 'print';
      document.head.appendChild(link);
    };

    // Small delay to ensure critical rendering is complete
    const timer = setTimeout(loadDeferredCSS, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
