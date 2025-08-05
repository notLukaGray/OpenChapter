'use client';

import React, { useEffect, useRef, useState } from 'react';
import { trackHeadingLinkCopy } from '../lib/analytics';
// CSS now imported via components.css

interface StaticHTMLRendererProps {
  htmlChunks: string[] | undefined;
  chunkSize?: number;
}

export default function StaticHTMLRenderer({
  htmlChunks,
  chunkSize = 2,
}: StaticHTMLRendererProps) {
  const [visibleChunks, setVisibleChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load initial chunks
  useEffect(() => {
    if (htmlChunks && htmlChunks.length > 0) {
      const initialChunks = htmlChunks.slice(0, chunkSize);
      setVisibleChunks(initialChunks);
      setCurrentChunkIndex(chunkSize);
    }
  }, [htmlChunks, chunkSize]);

  // Progressive loading with intersection observer
  useEffect(() => {
    if (
      !containerRef.current ||
      !htmlChunks ||
      currentChunkIndex >= htmlChunks.length
    )
      return;

    const loadNextChunks = () => {
      if (htmlChunks && currentChunkIndex < htmlChunks.length && !isLoading) {
        setIsLoading(true);

        // Simulate a small delay to prevent overwhelming the main thread
        setTimeout(() => {
          const nextChunks = htmlChunks!.slice(
            currentChunkIndex,
            currentChunkIndex + chunkSize
          );
          setVisibleChunks(prev => [...prev, ...nextChunks]);
          setCurrentChunkIndex(prev => prev + chunkSize);
          setIsLoading(false);
        }, 50);
      }
    };

    // Create intersection observer for the last visible element
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadNextChunks();
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    // Observe the last visible chunk
    const lastChunkElement = containerRef.current.lastElementChild;
    if (lastChunkElement) {
      observerRef.current.observe(lastChunkElement);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [htmlChunks, currentChunkIndex, isLoading, chunkSize]);

  // Add anchor functionality to headings
  useEffect(() => {
    const headings = document.querySelectorAll('h1[id], h2[id]');
    const headingElements = Array.from(headings) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        let mostVisible = entries[0];
        entries.forEach(entry => {
          if (entry.intersectionRatio > mostVisible.intersectionRatio) {
            mostVisible = entry;
          }
        });

        if (mostVisible.isIntersecting && mostVisible.intersectionRatio > 0.5) {
          const id = mostVisible.target.id;
          const newUrl = `${window.location.pathname}#${id}`;

          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, '', newUrl);
          }
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-80px 0px -80px 0px',
      }
    );

    const timeoutId = setTimeout(() => {
      headingElements.forEach(heading => observer.observe(heading));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [visibleChunks]);

  // Add click handlers for anchor buttons
  useEffect(() => {
    const anchorButtons = document.querySelectorAll('[data-anchor-id]');

    anchorButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const anchorId = button.getAttribute('data-anchor-id');
        if (!anchorId) return;

        const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
        try {
          await navigator.clipboard.writeText(url);

          // Get chapter info from URL
          const pathname = window.location.pathname;
          const chapterSlug = pathname.split('/').pop() || '';
          const chapterTitle = document.title.split(' | ')[0] || '';
          const headingText =
            button.closest('h1, h2')?.textContent?.trim() || '';

          trackHeadingLinkCopy(headingText, chapterTitle, chapterSlug);

          // Visual feedback
          button.classList.add('copied');
          setTimeout(() => button.classList.remove('copied'), 800);
        } catch (error) {
          console.error('Failed to copy link:', error);
        }
      });
    });

    return () => {
      anchorButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, [visibleChunks]);

  // Detect print events and load all content
  useEffect(() => {
    const handleBeforePrint = () => {
      // Load all remaining chunks when print is initiated
      if (htmlChunks && currentChunkIndex < htmlChunks.length) {
        const remainingChunks = htmlChunks.slice(currentChunkIndex);
        setVisibleChunks(prev => [...prev, ...remainingChunks]);
        setCurrentChunkIndex(htmlChunks.length);
      }
    };

    // Listen for print events
    window.addEventListener('beforeprint', handleBeforePrint);

    // Also listen for print media query changes
    const mediaQuery = window.matchMedia('print');
    const handlePrintMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        handleBeforePrint();
      }
    };

    mediaQuery.addEventListener('change', handlePrintMediaChange);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      mediaQuery.removeEventListener('change', handlePrintMediaChange);
    };
  }, [htmlChunks, currentChunkIndex]);

  return (
    <div ref={containerRef} className="static-html-renderer">
      {visibleChunks.map((chunk, index) => (
        <div key={index} className="html-chunk">
          <div
            dangerouslySetInnerHTML={{
              __html: chunk,
            }}
          />
        </div>
      ))}

      {isLoading && (
        <div className="loading-indicator">
          <div className="animate-pulse text-gray-400 text-sm">
            Loading more content...
          </div>
        </div>
      )}
    </div>
  );
}
