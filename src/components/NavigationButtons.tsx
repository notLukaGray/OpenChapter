'use client';

import Link from 'next/link';
import { trackChapterNavigation, trackSideButtonUsage } from '../lib/analytics';
// CSS now imported via components.css

interface NavigationButtonsProps {
  prevChapter?: { slug: string; chapter: string };
  nextChapter?: { slug: string; chapter: string };
  currentChapter: string;
}

export default function NavigationButtons({
  prevChapter,
  nextChapter,
  currentChapter,
}: NavigationButtonsProps) {
  return (
    <>
      {prevChapter && (
        <Link
          href={`/${prevChapter.slug}`}
          className="nav-button nav-button-left"
          onClick={() => {
            // Track navigation to previous chapter
            trackChapterNavigation(
              currentChapter,
              prevChapter.chapter,
              'previous'
            );
            // Track side button usage specifically
            trackSideButtonUsage(
              currentChapter,
              prevChapter.chapter,
              'previous',
              'left'
            );
          }}
        >
          <div className="nav-button-icon">‹</div>
        </Link>
      )}

      {nextChapter && (
        <Link
          href={`/${nextChapter.slug}`}
          className="nav-button nav-button-right"
          onClick={() => {
            // Track navigation to next chapter
            trackChapterNavigation(currentChapter, nextChapter.chapter, 'next');
            // Track side button usage specifically
            trackSideButtonUsage(
              currentChapter,
              nextChapter.chapter,
              'next',
              'right'
            );
          }}
        >
          <div className="nav-button-icon">›</div>
        </Link>
      )}
    </>
  );
}
