'use client';

import { useEffect } from 'react';

export default function PrintCSSLoader() {
  useEffect(() => {
    // Load print CSS only when needed
    const loadPrintCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/print.css'; // We'll move the CSS to public
      link.media = 'print';
      document.head.appendChild(link);
    };

    // Load on print event
    const handleBeforePrint = () => {
      loadPrintCSS();
    };

    // Also load when user might print (Ctrl+P, Cmd+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        loadPrintCSS();
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
}
