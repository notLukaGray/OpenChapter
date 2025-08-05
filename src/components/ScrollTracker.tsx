'use client';

import { useEffect, useRef } from 'react';
import { trackScrollDepth, trackTimeOnPage } from '../lib/analytics';

interface ScrollTrackerProps {
  chapterTitle: string;
  chapterSlug: string;
}

export default function ScrollTracker({
  chapterTitle,
  chapterSlug,
}: ScrollTrackerProps): null {
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);

  useEffect(() => {
    const currentStartTime = startTime.current; // Capture the value

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Only track if scroll depth increased significantly (every 10%)
      if (scrollDepth > maxScrollDepth.current + 10) {
        maxScrollDepth.current = scrollDepth;
        trackScrollDepth(chapterTitle, chapterSlug, scrollDepth);
      }
    };

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - currentStartTime) / 1000);
      trackTimeOnPage(chapterTitle, chapterSlug, timeOnPage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Track time on page when component unmounts
      const timeOnPage = Math.round((Date.now() - currentStartTime) / 1000);
      trackTimeOnPage(chapterTitle, chapterSlug, timeOnPage);
    };
  }, [chapterTitle, chapterSlug]);

  return null; // This component doesn't render anything
}
