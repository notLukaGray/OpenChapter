# @openchapter/core

Core components and utilities for creating interactive web books with audio narration.

## Installation

```bash
npm install @openchapter/core
```

## Usage

### Basic Audio Player

```tsx
import { AudioPlayer } from '@openchapter/core';

function MyComponent() {
  return (
    <AudioPlayer 
      audioUrl="/audio/chapter-1.mp3"
      title="Chapter 1: Introduction"
      autoPlay={false}
    />
  );
}
```

### Markdown Processing

```tsx
import { processMarkdown, extractMetadata } from '@openchapter/core';

// Process markdown content
const htmlContent = await processMarkdown(markdownContent, {
  includeMath: true,
  includeFootnotes: true,
  includeGfm: true
});

// Extract metadata from markdown frontmatter
const metadata = extractMetadata(markdownContent);
```

### Search Functionality

```tsx
import { searchContent } from '@openchapter/core';

const results = await searchContent(query, chapters, {
  minScore: 0.1,
  maxResults: 10
});
```

## Components

### AudioPlayer

A customizable audio player component with playback controls.

**Props:**
- `audioUrl` (string): URL of the audio file
- `title` (string, optional): Title to display
- `autoPlay` (boolean, optional): Auto-play on load
- `showControls` (boolean, optional): Show/hide controls
- `className` (string, optional): Additional CSS classes
- `onPlay` (function, optional): Play event handler
- `onPause` (function, optional): Pause event handler
- `onEnded` (function, optional): End event handler

## Utilities

### processMarkdown

Processes markdown content with various plugins.

**Options:**
- `includeMath` (boolean): Enable math rendering
- `includeFootnotes` (boolean): Enable footnotes
- `includeGfm` (boolean): Enable GitHub Flavored Markdown
- `allowRawHtml` (boolean): Allow raw HTML in markdown

### extractMetadata

Extracts metadata from markdown frontmatter.

### searchContent

Performs full-text search on chapter content.

## Types

```tsx
interface Chapter {
  slug: string;
  title: string;
  content: string;
  metadata: ChapterMetadata;
  audioUrl?: string;
  order: number;
}

interface AudioConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}
```

## License

MIT License - see the main repository for details. 