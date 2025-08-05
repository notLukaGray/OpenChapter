'use client';

import { useState } from 'react';
import { siteConfig } from '../lib/config';
import {
  trackShareAttempt,
  trackShareSuccess,
  trackShareFailure,
} from '../lib/analytics';
import { logError } from '../lib/error-handling';
// CSS now imported via components.css

interface ShareButtonProps {
  chapter: string;
  chapterSlug: string;
}

export default function ShareButton({
  chapter,
  chapterSlug,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${siteConfig.shortDomain}/${chapterSlug}`;
  const shareText = `Check out "${chapter}" from "${siteConfig.title}" by ${siteConfig.author}`;

  const handleShare = async () => {
    // Track share attempt
    trackShareAttempt(chapter, chapterSlug, 'native');

    if (navigator.share) {
      try {
        await navigator.share({
          title: chapter,
          text: shareText,
          url: shareUrl,
        });
        // Track successful native share
        trackShareSuccess(chapter, chapterSlug, 'native');
      } catch (error) {
        // User cancelled or error occurred, fall back to copy
        trackShareFailure(chapter, chapterSlug, 'native', error?.toString());
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    // Track copy attempt
    trackShareAttempt(chapter, chapterSlug, 'copy');

    try {
      // Ensure document is focused
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Track successful copy
        trackShareSuccess(chapter, chapterSlug, 'copy');
      } else {
        // Fallback: create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          // Track successful copy
          trackShareSuccess(chapter, chapterSlug, 'copy');
        } catch (err) {
          logError('Fallback copy failed', err, {
            component: 'ShareButton',
            action: 'fallback_copy',
            data: { chapter, chapterSlug, shareUrl },
          });
          // Track copy failure
          trackShareFailure(chapter, chapterSlug, 'copy', err?.toString());
          // Show URL in an alert as last resort
          alert(`Copy this URL: ${shareUrl}`);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      logError('Failed to copy URL', error, {
        component: 'ShareButton',
        action: 'copy_url',
        data: { chapter, chapterSlug, shareUrl },
      });
      // Track copy failure
      trackShareFailure(chapter, chapterSlug, 'copy', error?.toString());
      // Show URL in an alert as last resort
      alert(`Copy this URL: ${shareUrl}`);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="share-button"
        title="Share this chapter"
      >
        {copied ? (
          <svg
            className="share-button-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="share-button-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
        )}
      </button>

      {}
      {copied && <div className="share-toast">URL copied to clipboard!</div>}
    </>
  );
}
