// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      parameters: {
        event_category: string;
        event_label?: string;
        value?: number;
        [key: string]: string | number | boolean | undefined;
      }
    ) => void;
  }
}

// Helper function to check if analytics is available
const isAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.gtag;
};

// Helper function to send analytics events
const sendAnalyticsEvent = (
  action: string,
  parameters: {
    event_category: string;
    event_label?: string;
    value?: number;
    [key: string]: string | number | boolean | undefined;
  }
): void => {
  if (isAnalyticsAvailable()) {
    window.gtag('event', action, parameters);
  }
};

// Track audio play events
export const trackAudioPlay = (audioFile: string, chapterTitle?: string) => {
  sendAnalyticsEvent('audio_play', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
  });
};

// Track audio pause events
export const trackAudioPause = (audioFile: string, chapterTitle?: string) => {
  sendAnalyticsEvent('audio_pause', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
  });
};

// Track audio completion events
export const trackAudioComplete = (
  audioFile: string,
  chapterTitle?: string
) => {
  sendAnalyticsEvent('audio_complete', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
  });
};

// Track playback speed changes
export const trackPlaybackSpeedChange = (
  audioFile: string,
  speed: number,
  chapterTitle?: string
) => {
  sendAnalyticsEvent('audio_speed_change', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
    value: speed,
  });
};

// Track audio seek events
export const trackAudioSeek = (
  audioFile: string,
  seekTime: number,
  chapterTitle?: string
) => {
  sendAnalyticsEvent('audio_seek', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
    value: seekTime,
  });
};

// Track listening duration
export const trackListeningDuration = (
  audioFile: string,
  chapterTitle: string,
  listeningTime: number,
  totalDuration: number
) => {
  sendAnalyticsEvent('listening_duration', {
    event_category: 'audio',
    event_label: audioFile,
    chapter_title: chapterTitle,
    value: listeningTime,
    total_duration: totalDuration,
  });
};

// Search Analytics Functions

// Track search initiation
export const trackSearchInitiated = (query: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_initiated', {
      event_category: 'search',
      event_label: query,
      search_term: query,
    });
  }
};

// Track search results
export const trackSearchResults = (query: string, resultCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_results', {
      event_category: 'search',
      event_label: query,
      search_term: query,
      value: resultCount,
    });
  }
};

// Track search result click
export const trackSearchResultClick = (
  query: string,
  resultTitle: string,
  resultSlug: string,
  resultPosition: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_result_click', {
      event_category: 'search',
      event_label: query,
      search_term: query,
      result_title: resultTitle,
      result_slug: resultSlug,
      value: resultPosition,
    });
  }
};

// Track search with no results
export const trackSearchNoResults = (query: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_no_results', {
      event_category: 'search',
      event_label: query,
      search_term: query,
    });
  }
};

// Track search load more
export const trackSearchLoadMore = (
  query: string,
  currentCount: number,
  newCount: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_load_more', {
      event_category: 'search',
      event_label: query,
      search_term: query,
      value: newCount,
      current_count: currentCount,
    });
  }
};

// Track search page view
export const trackSearchPageView = (query: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_page_view', {
      event_category: 'search',
      event_label: query,
      search_term: query,
    });
  }
};

// Share Button Analytics Functions

// Track share attempts
export const trackShareAttempt = (
  chapterTitle: string,
  chapterSlug: string,
  shareMethod: 'native' | 'copy'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share_attempt', {
      event_category: 'share',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      share_method: shareMethod,
    });
  }
};

// Track share success
export const trackShareSuccess = (
  chapterTitle: string,
  chapterSlug: string,
  shareMethod: 'native' | 'copy'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share_success', {
      event_category: 'share',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      share_method: shareMethod,
    });
  }
};

// Track share failure
export const trackShareFailure = (
  chapterTitle: string,
  chapterSlug: string,
  shareMethod: 'native' | 'copy',
  error?: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share_failure', {
      event_category: 'share',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      share_method: shareMethod,
      error_message: error,
    });
  }
};

// Navigation Analytics Functions

// Track chapter navigation (previous/next)
export const trackChapterNavigation = (
  fromChapter: string,
  toChapter: string,
  direction: 'previous' | 'next'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chapter_navigation', {
      event_category: 'navigation',
      event_label: `${fromChapter} → ${toChapter}`,
      from_chapter: fromChapter,
      to_chapter: toChapter,
      direction: direction,
    });
  }
};

// Track side button usage specifically
export const trackSideButtonUsage = (
  fromChapter: string,
  toChapter: string,
  direction: 'previous' | 'next',
  buttonPosition: 'left' | 'right'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'side_button_click', {
      event_category: 'navigation',
      event_label: `${direction} button (${buttonPosition})`,
      from_chapter: fromChapter,
      to_chapter: toChapter,
      direction: direction,
      button_position: buttonPosition,
    });
  }
};

// Track navigation menu interactions
export const trackNavMenuInteraction = (
  action: 'open' | 'close' | 'hover',
  chapterTitle?: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'nav_menu_interaction', {
      event_category: 'navigation',
      event_label: action,
      action: action,
      chapter_title: chapterTitle,
    });
  }
};

// Track search button clicks
export const trackSearchButtonClick = (location: 'nav' | 'modal' | 'page') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_button_click', {
      event_category: 'search',
      event_label: location,
      search_location: location,
    });
  }
};

// Track search modal interactions
export const trackSearchModalInteraction = (
  action: 'open' | 'close' | 'result_click',
  query?: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search_modal_interaction', {
      event_category: 'search',
      event_label: action,
      action: action,
      search_query: query,
    });
  }
};

// Content Interaction Analytics Functions

// Track heading link copies
export const trackHeadingLinkCopy = (
  headingText: string,
  chapterTitle: string,
  chapterSlug: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'heading_link_copy', {
      event_category: 'content',
      event_label: headingText,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
    });
  }
};

// Track scroll depth
export const trackScrollDepth = (
  chapterTitle: string,
  chapterSlug: string,
  depth: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'scroll_depth', {
      event_category: 'content',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      value: depth,
    });
  }
};

// Track time on page
export const trackTimeOnPage = (
  chapterTitle: string,
  chapterSlug: string,
  timeInSeconds: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'time_on_page', {
      event_category: 'content',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      value: timeInSeconds,
    });
  }
};

// Performance Analytics Functions

// Track page load performance
export const trackPageLoadPerformance = (
  chapterTitle: string,
  chapterSlug: string,
  loadTime: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_load_performance', {
      event_category: 'performance',
      event_label: chapterTitle,
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      value: loadTime,
    });
  }
};

// Track audio loading performance
export const trackAudioLoadPerformance = (
  audioFile: string,
  chapterTitle: string,
  loadTime: number,
  success: boolean
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'audio_load_performance', {
      event_category: 'performance',
      event_label: audioFile,
      chapter_title: chapterTitle,
      value: loadTime,
      success: success,
    });
  }
};
