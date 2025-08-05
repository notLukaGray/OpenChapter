'use client';

import React from 'react';
// CSS now imported via components.css

interface ImageAttributionProps {
  author?: string;
  imageUrl?: string;
  className?: string;
}

export default function ImageAttribution({
  author,
  imageUrl,
  className = '',
}: ImageAttributionProps) {
  if (!author) return null;

  return (
    <div
      className={`absolute z-[9999] bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-30 hover:opacity-100 transition-opacity duration-200 uppercase tracking-wide shadow-lg image-attribution-container ${className}`}
    >
      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white no-underline hover:text-white transition-colors duration-200 uppercase tracking-wide image-attribution-link"
        >
          {author.toUpperCase()}
        </a>
      ) : (
        <span className="text-white uppercase tracking-wide image-attribution-text">
          {author.toUpperCase()}
        </span>
      )}
    </div>
  );
}
