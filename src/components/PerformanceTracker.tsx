'use client';

import { useEffect } from 'react';
import { trackPageLoadPerformance } from '../lib/analytics';

interface PerformanceTrackerProps {
  chapterTitle: string;
  chapterSlug: string;
}

export default function PerformanceTracker({
  chapterTitle,
  chapterSlug,
}: PerformanceTrackerProps): null {
  useEffect(() => {
    // Track page load performance
    const trackPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          trackPageLoadPerformance(chapterTitle, chapterSlug, loadTime);
        }
      }
    };

    // Track after page is fully loaded
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
      return () => window.removeEventListener('load', trackPerformance);
    }
  }, [chapterTitle, chapterSlug]);

  return null; // This component doesn't render anything
}
