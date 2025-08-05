'use client';

// CSS now imported via components.css

interface SearchButtonProps {
  onClick: (e: React.MouseEvent) => void;
  mode: 'open' | 'search';
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export default function SearchButton({
  onClick,
  mode,
  className = '',
  style = {},
  onMouseEnter,
  onMouseLeave,
}: SearchButtonProps) {
  const isSearchMode = mode === 'search';

  return (
    <button
      onClick={onClick}
      className={`search-button ${isSearchMode ? 'search-mode' : ''} ${className}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={isSearchMode ? 'Search' : 'Search the book'}
    >
      <svg
        width={isSearchMode ? '18' : '14'}
        height={isSearchMode ? '18' : '14'}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isSearchMode ? '#b95b23' : '#888'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}
