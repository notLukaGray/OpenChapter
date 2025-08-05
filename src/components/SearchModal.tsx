'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/lib/search';
import SearchButton from './SearchButton';
import { logError } from '../lib/error-handling';
// CSS now imported via components.css

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
  message: string;
  error?: string;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debouncedSearchRef = useRef<(searchQuery: string) => void>(null);

  useEffect(() => {
    debouncedSearchRef.current = debounce(async (searchQuery: unknown) => {
      const query = searchQuery as string;
      if (query.trim().length < 3) {
        setResults([]);
        setMessage('');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=8`
        );
        const data: SearchResponse = await response.json();

        setResults(data.results || []);
        setMessage(data.message || '');
        setSelectedIndex(-1);
      } catch (error) {
        logError('Search error', error, {
          component: 'SearchModal',
          action: 'perform_search',
          data: { searchQuery: query },
        });
        setResults([]);
        setMessage('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setMessage('');
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    debouncedSearchRef.current?.(query);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    }

    if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    const url = result.anchorId
      ? `/${result.slug}#${result.anchorId}`
      : `/${result.slug}`;
    router.push(url);
    onClose();
  };

  // Handle search button click
  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (query.trim().length >= 3) {
      debouncedSearchRef.current?.(query);
    }
    inputRef.current?.focus();
  };

  // Highlight search terms in text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const terms = searchQuery.toLowerCase().split(/\s+/);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark style="background-color: var(--color-accent); color: white; padding: 1px 3px; border-radius: 2px;">$1</mark>'
      );
    });

    return highlightedText;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {}
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              Search a book
            </h2>
          </div>

          {}
          <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  id="search-input"
                  name="search-query"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type to search chapters..."
                  className="block w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-base transition-colors"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {}
              <SearchButton
                onClick={handleSearchButtonClick}
                mode="search"
                className="search-modal-button"
              />
            </div>
          </div>

          {}
          <div
            ref={resultsRef}
            className="max-h-96 overflow-y-auto search-modal-results-container"
          >
            {isLoading && (
              <div className="p-4 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {!isLoading && query.trim().length > 0 && results.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium mb-1">
                    {message?.includes('at least 3 characters')
                      ? 'Search too short'
                      : 'No results found'}
                  </p>
                  <p className="text-sm">
                    {message || `No chapters found for "${query}"`}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <>
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  {message}
                </div>
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-2 transition-colors ${
                        selectedIndex === index
                          ? 'search-result-selected'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-medium text-gray-900 dark:text-white text-sm leading-tight"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(result.title, query),
                              }}
                            />
                            {result.heading &&
                              result.heading !== result.title && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {result.heading}
                                </p>
                              )}
                          </div>
                          <span
                            className="text-xs ml-2 shrink-0"
                            style={{ color: 'var(--color-accent)' }}
                          >
                            {result.chapter}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {result.part}
                        </p>
                        <p
                          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(result.excerpt, query),
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isLoading && query.trim().length === 0 && (
              <div className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-1">Search the book</p>
                  <p className="text-sm">
                    Start typing to find chapters, topics, and content
                  </p>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">
                    ↑↓
                  </kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">
                    ↵
                  </kbd>
                  <span>select</span>
                </span>
                <span className="flex items-center space-x-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">
                    esc
                  </kbd>
                  <span>close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
