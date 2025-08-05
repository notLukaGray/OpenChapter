'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SearchButton from './SearchButton';
import { useRouter, usePathname } from 'next/navigation';
import { SearchResult } from '@/lib/search';
import { siteConfig } from '@/lib/config';
import {
  trackSearchButtonClick,
  trackSearchModalInteraction,
  trackNavMenuInteraction,
} from '../lib/analytics';
import { logError } from '../lib/error-handling';

interface NavItem {
  part: string;
  chapters: { slug: string; title: string; order: number }[];
}

interface NavMenuProps {
  navItems: NavItem[];
}

export default function NavMenu({ navItems }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Debounced search function
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  // Perform search for modal overlay (top 3 results only)
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=3`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      logError('Search error', error, {
        component: 'NavMenu',
        action: 'perform_search',
        data: { searchQuery },
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setIsLoading(value.trim().length >= 2);

    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }

    debouncedSearch.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle search activation
  const handleSearchActivate = () => {
    setSearchActive(true);
    trackSearchButtonClick('nav');
    trackSearchModalInteraction('open');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 1000);
  };

  // Handle search deactivation
  const handleSearchDeactivate = () => {
    setSearchActive(false);
    trackSearchModalInteraction('close');
    setQuery('');
    setResults([]);
    setIsLoading(false);
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    trackSearchModalInteraction('result_click', query);
    router.push(
      `/${result.slug}${result.anchorId ? `#${result.anchorId}` : ''}`
    );
    handleSearchDeactivate();
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      handleSearchDeactivate();
    }
  };

  // Handle escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchActive) {
        handleSearchDeactivate();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchActive &&
        searchInputRef.current &&
        !searchInputRef.current.closest('div')?.contains(e.target as Node)
      ) {
        handleSearchDeactivate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, [searchActive]);

  // Set mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    const checkTiny = () => setIsTiny(window.innerWidth <= 400);

    checkMobile();
    checkTiny();

    window.addEventListener('resize', () => {
      checkMobile();
      checkTiny();
    });

    return () =>
      window.removeEventListener('resize', () => {
        checkMobile();
        checkTiny();
      });
  }, []);

  // Reset navbar state when route changes
  useEffect(() => {
    setOpen(false);
    setHovered(false);
    handleSearchDeactivate();
  }, [pathname]);

  // Prevent background scroll when nav is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [open]);

  // Flatten navItems
  const flatNav: { type: 'part' | 'chapter'; text: string; slug?: string }[] =
    [];
  navItems.forEach(({ part, chapters }) => {
    flatNav.push({ type: 'part', text: part });
    chapters.forEach(chapter =>
      flatNav.push({ type: 'chapter', text: chapter.title, slug: chapter.slug })
    );
  });

  return (
    <div
      ref={navBarRef}
      className={`nav-menu-container ${hovered ? 'hovered' : ''} ${open ? 'open' : ''}`}
      onClick={() => {
        // Don't toggle nav menu when search is active
        if (searchActive) {
          return;
        }
        const newOpenState = !open;
        setOpen(newOpenState);
        trackNavMenuInteraction(newOpenState ? 'open' : 'close');
      }}
      onMouseEnter={() => {
        setHovered(true);
        trackNavMenuInteraction('hover');
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="nav-menu-bar">
        {}
        <div
          className="nav-menu-search-section"
          onClick={e => e.stopPropagation()}
          onMouseEnter={() => setHovered(false)}
          onMouseLeave={e => {
            // Check if mouse is still over nav bar
            if (navBarRef.current) {
              const { clientX, clientY } = e;
              const el = document.elementFromPoint(clientX, clientY);
              if (el && navBarRef.current.contains(el)) {
                setHovered(true);
              }
            }
          }}
        >
          <div
            className={`nav-menu-search-container ${searchActive ? 'active' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <input
              ref={searchInputRef}
              type="text"
              id="nav-menu-search-input"
              name="nav-menu-search"
              value={query}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search chapters..."
              className={`nav-menu-search-input ${searchActive ? 'active' : ''}`}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  handleSearchDeactivate();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
                e.stopPropagation();
              }}
              onMouseEnter={() => setHovered(false)}
              onMouseLeave={(e: React.MouseEvent) => {
                if (navBarRef.current) {
                  const { clientX, clientY } = e;
                  const el = document.elementFromPoint(clientX, clientY);
                  if (el && navBarRef.current.contains(el)) {
                    setHovered(true);
                  }
                }
              }}
            />
            <SearchButton
              onClick={e => {
                e.stopPropagation();
                if (searchActive) {
                  if (query.trim()) {
                    handleSearchSubmit();
                  } else {
                    handleSearchDeactivate();
                  }
                } else {
                  handleSearchActivate();
                }
              }}
              mode={searchActive && query.trim() ? 'search' : 'open'}
              onMouseEnter={() => setHovered(false)}
              onMouseLeave={(e: React.MouseEvent) => {
                if (navBarRef.current) {
                  const { clientX, clientY } = e;
                  const el = document.elementFromPoint(clientX, clientY);
                  if (el && navBarRef.current.contains(el)) {
                    setHovered(true);
                  }
                }
              }}
            />
          </div>
        </div>

        <div
          className={`nav-menu-title-link ${isMobile && searchActive ? 'mobile-search-active' : ''}`}
          onClick={e => {
            if (isMobile && searchActive) {
              e.preventDefault();
              return;
            }
            e.stopPropagation();
            router.push('/');
          }}
          onMouseEnter={() => setHovered(false)}
          onMouseLeave={e => {
            if (navBarRef.current) {
              const { clientX, clientY } = e;
              const el = document.elementFromPoint(clientX, clientY);
              if (el && navBarRef.current.contains(el)) {
                setHovered(true);
              }
            }
          }}
        >
          <span
            className={`nav-menu-title-text ${isMobile && searchActive ? 'mobile-search-active' : ''}`}
          >
            {isTiny
              ? siteConfig.title
              : `${siteConfig.title} – ${siteConfig.author}`}
          </span>
        </div>

        <span className="nav-menu-hamburger">
          <span className="nav-menu-hamburger-line"></span>
          <span className="nav-menu-hamburger-line"></span>
          <span className="nav-menu-hamburger-line"></span>
        </span>
      </div>

      {}
      {open && (
        <div className="nav-menu-items-container">
          {flatNav.map((item, i) => {
            const isPart = item.type === 'part';

            if (isPart) {
              return (
                <div
                  key={`part-${item.text}-${i}`}
                  className="nav-menu-part-item"
                >
                  {item.text}
                </div>
              );
            } else {
              return (
                <Link
                  key={`chapter-${item.slug}-${i}`}
                  href={`/${item.slug}`}
                  onClick={e => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="nav-menu-chapter-link"
                >
                  {item.text}
                </Link>
              );
            }
          })}
          <div className="nav-menu-bottom-spacer"></div>
        </div>
      )}

      {}
      {searchActive && query.length >= 2 && (
        <div className="nav-menu-search-overlay">
          <div
            className="nav-menu-search-backdrop"
            onClick={handleSearchDeactivate}
          />

          <div className="nav-menu-search-modal">
            <div className="nav-menu-search-header">
              <div className="nav-menu-search-title">
                {isLoading ? 'Searching...' : `Quick Results for "${query}"`}
              </div>
              <button
                onClick={handleSearchDeactivate}
                className="nav-menu-search-close"
              >
                ✕
              </button>
            </div>

            {isLoading && (
              <div className="nav-menu-search-loading">
                <div>Searching through chapters...</div>
              </div>
            )}

            {!isLoading && results.length === 0 && query.length >= 2 && (
              <div className="nav-menu-search-no-results">
                <div>No quick results found for &quot;{query}&quot;</div>
                <div className="nav-menu-search-no-results-subtitle">
                  Try the full search page for more results
                </div>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div>
                {results.map((result, index) => (
                  <div
                    key={`search-result-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="nav-menu-search-result"
                  >
                    <div className="nav-menu-search-result-title">
                      {result.heading || result.title}
                    </div>
                    <div className="nav-menu-search-result-meta">
                      {result.part} • Chapter {result.chapter}
                    </div>
                    <div className="nav-menu-search-result-excerpt">
                      {result.excerpt.substring(0, 100)}...
                    </div>
                  </div>
                ))}

                <div className="nav-menu-search-footer">
                  <button
                    onClick={handleSearchSubmit}
                    className="nav-menu-search-view-all"
                  >
                    View all results on search page →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
