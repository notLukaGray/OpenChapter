'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchResult } from '@/lib/search';
import {
  trackSearchInitiated,
  trackSearchResults,
  trackSearchResultClick,
  trackSearchNoResults,
  trackSearchLoadMore,
  trackSearchPageView,
} from '../../lib/analytics';
import { logError } from '@/lib/error-handling';
import '../../styles/search-page.css';

interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
  message: string;
  error?: string;
}

export default function SearchClientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(query);
  const [displayCount, setDisplayCount] = useState(3);
  const [hasMore, setHasMore] = useState(false);

  // Perform search
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 3) {
      setResults([]);
      setAllResults([]);
      setMessage('');
      setDisplayCount(8);
      setHasMore(false);
      return;
    }

    // Track search initiation
    trackSearchInitiated(searchTerm);

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&limit=300`
      );
      const data: SearchResponse = await response.json();

      const allResultsData = data.results || [];
      setAllResults(allResultsData);
      setResults(allResultsData.slice(0, 8));
      setDisplayCount(8);
      setHasMore(allResultsData.length > 8);
      setMessage(data.message || '');

      // Track search results
      if (allResultsData.length === 0) {
        trackSearchNoResults(searchTerm);
      } else {
        trackSearchResults(searchTerm, allResultsData.length);
      }
    } catch (error) {
      logError('Search error', error, {
        component: 'SearchClientPage',
        action: 'perform_search',
        data: { searchTerm },
      });
      setResults([]);
      setAllResults([]);
      setMessage('Search failed. Please try again.');
      setHasMore(false);

      // Track search error
      trackSearchNoResults(searchTerm);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more results
  const loadMoreResults = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Brief loading delay for smooth UX
    setTimeout(() => {
      const newCount = displayCount + 5;
      setResults(allResults.slice(0, newCount));
      setDisplayCount(newCount);
      setHasMore(newCount < allResults.length);
      setIsLoadingMore(false);

      // Track load more event
      if (query) {
        trackSearchLoadMore(query, displayCount, newCount);
      }
    }, 300);
  }, [isLoadingMore, hasMore, displayCount, allResults, query]);

  // Search when query parameter changes
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
      // Track search page view
      trackSearchPageView(query);
    }
  }, [query]);

  // Scroll detection for infinite loading
  useEffect(() => {
    if (!hasMore || allResults.length === 0) return;

    const container = resultsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isLoadingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = scrollHeight - 200; // Load when 200px from bottom

      if (scrollTop + clientHeight >= threshold && hasMore && !isLoadingMore) {
        loadMoreResults();
      }
    };

    // Add scroll listener to the results container
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [
    hasMore,
    isLoadingMore,
    allResults.length,
    results.length,
    loadMoreResults,
  ]);

  // Handle new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Helper function to escape regex characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Strip HTML tags from text
  const stripHtmlTags = (text: string): string => {
    return text.replace(/<[^>]*>/g, '');
  };

  // Highlight search terms in text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    // First strip HTML tags from the text
    const cleanText = stripHtmlTags(text);

    const terms = searchQuery.toLowerCase().split(/\s+/);
    let highlightedText = cleanText;

    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark style="background-color: #b95b23; color: white; padding: 1px 3px; border-radius: 2px;">$1</mark>'
      );
    });

    return highlightedText;
  };

  return (
    <div className="search-page-container">
      <div className="search-page-header">
        <div className="search-page-content">
          <Link href="/" className="search-page-back-link">
            ← Back to Book
          </Link>

          <h1 className="search-page-title">Search Results</h1>

          <form onSubmit={handleSearch} className="search-page-form">
            <div className="search-page-form-container">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search the book..."
                className="search-page-input"
              />
              <button type="submit" className="search-page-button">
                Search
              </button>
            </div>
          </form>

          {query && (
            <p className="search-page-status">
              {isLoading
                ? 'Searching...'
                : allResults.length > 0
                  ? `Showing ${results.length} of ${allResults.length} results for "${query}"`
                  : message || `No results for "${query}"`}
            </p>
          )}
        </div>
      </div>
      <div ref={resultsContainerRef} className="search-page-results-container">
        {isLoading && (
          <div className="search-page-loading">
            <div>Searching through chapters...</div>
          </div>
        )}
        {!isLoading && query && allResults.length === 0 && (
          <div className="search-page-no-results">
            <div>{message || `No results found for "${query}"`}</div>
            <div className="search-page-no-results-subtitle">
              {message?.includes('at least 3 characters')
                ? 'Please enter at least 3 characters to search'
                : 'Try different keywords or check your spelling'}
            </div>
          </div>
        )}
        {!isLoading && results.length > 0 && (
          <React.Fragment key="search-results-container">
            <div className="search-page-results-list">
              {results.map((result, index) => {
                // Use a more robust key that doesn't rely on potentially duplicate IDs
                const key = `search-result-${index}-${result.slug}-${result.anchorId || 'no-anchor'}`;
                return (
                  <div key={key} className="search-page-result-item">
                    <div className="search-page-result-header">
                      <Link
                        href={`/${result.slug}${result.anchorId ? `#${result.anchorId}` : ''}`}
                        className="search-page-result-title"
                        onClick={() => {
                          // Track search result click
                          trackSearchResultClick(
                            query,
                            result.heading || result.title,
                            result.slug,
                            results.indexOf(result) + 1
                          );
                        }}
                      >
                        {result.heading || result.title}
                      </Link>
                      <div className="search-page-result-meta">
                        {result.part} • Chapter {result.chapter}{' '}
                        {result.heading &&
                          result.heading !== result.title &&
                          ` • ${result.heading}`}
                      </div>
                    </div>
                    <div
                      className="search-page-result-excerpt"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(result.excerpt, query),
                      }}
                    />
                    <Link
                      href={`/${result.slug}${result.anchorId ? `#${result.anchorId}` : ''}`}
                      className="search-page-result-link"
                      onClick={() => {
                        // Track search result click
                        trackSearchResultClick(
                          query,
                          result.heading || result.title,
                          result.slug,
                          results.indexOf(result) + 1
                        );
                      }}
                    >
                      Read in context →
                    </Link>
                  </div>
                );
              })}
            </div>
            {isLoadingMore && (
              <div className="search-page-loading-more">
                <div className="search-page-loading-more-text">
                  Loading more results...
                </div>
              </div>
            )}
            {!hasMore && !isLoadingMore && allResults.length > 3 && (
              <div className="search-page-end-message">
                You&apos;ve seen all {allResults.length} results
              </div>
            )}
          </React.Fragment>
        )}
        {message && !isLoading && allResults.length === 0 && (
          <div className="search-page-message">{message}</div>
        )}
      </div>
    </div>
  );
}
