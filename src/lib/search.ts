import { Index } from 'flexsearch';

import { logError } from './error-handling';
import fs from 'fs';
import path from 'path';

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  part: string;
  chapter: string;
  excerpt: string;
  content: string;
  heading?: string;
  anchorId?: string;
}

export interface SearchIndex {
  index: Index;
  data: SearchResult[];
}

// Create and populate search index - lightweight version
export async function createSearchIndex(): Promise<SearchIndex> {
  const contentDir = path.join(process.cwd(), 'src/content');
  const files = fs.readdirSync(contentDir);
  const markdownFiles = files.filter(f => f.endsWith('.md') && f !== 'home.md');

  // Create FlexSearch index with optimized settings for better performance
  const index = new Index({
    preset: 'match', // Optimized for matching capabilities
    tokenize: 'forward', // Good for partial matching
    resolution: 3, // Reduced resolution for better performance
    cache: true, // Enable caching for better performance
  });

  // Prepare searchable data by parsing sections within chapters
  const searchData: SearchResult[] = [];
  let indexId = 0;

  // Process each markdown file directly without HTML conversion
  for (const file of markdownFiles) {
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(contentDir, file);
    const md = fs.readFileSync(filePath, 'utf8');

    // Quick regex parsing for metadata
    const chapterMatch = md.match(/Chapter: ([^\n]+)/);
    const partMatch = md.match(/Part: ([^\n]+)/);
    const contentMatch = md.match(/---\n([\s\S]*)/);

    if (!chapterMatch || !contentMatch) continue;

    const chapterTitle = chapterMatch[1].trim();
    const part = partMatch ? partMatch[1].trim() : '';
    const content = contentMatch[1].trim();

    // Parse the content into sections based on headings
    const sections = parseChapterSections(content, chapterTitle);

    sections.forEach(section => {
      // Clean the content for search indexing
      const cleanContent = cleanMarkdownContent(section.content);
      const searchableText = `${chapterTitle} ${section.heading} ${cleanContent}`;

      const result: SearchResult = {
        id: indexId.toString(),
        slug,
        title: chapterTitle,
        part,
        chapter: chapterTitle,
        excerpt: createExcerpt(section.content, 150), // Reduced excerpt length
        content: cleanContent, // Store cleaned content for search results
        heading: section.heading,
        anchorId: section.anchorId,
      };

      // Add to FlexSearch index
      index.add(indexId, searchableText);
      searchData.push(result);
      indexId++;
    });
  }

  return { index, data: searchData };
}

// Clean markdown content for search indexing
function cleanMarkdownContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italics
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/!\[(.*?)\]\(.*?\)/g, '') // Remove images
    .replace(/>\s*(.*)/g, '$1') // Remove blockquotes
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^\s*\|.*\|.*$/gm, '') // Remove table rows
    .replace(/^\s*---+\s*$/gm, '') // Remove horizontal rules
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Parse chapter content into sections based on headings
function parseChapterSections(
  content: string,
  chapterHeading: string
): Array<{
  heading: string;
  content: string;
  anchorId: string;
}> {
  const lines = content.split('\n');
  const sections: Array<{
    heading: string;
    content: string;
    anchorId: string;
  }> = [];

  let currentHeading = chapterHeading;
  let currentContent: string[] = [];
  let currentAnchorId = '';

  // Helper function to create anchor ID from heading text
  const createAnchorId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check if this line is a heading (# or ##)
    const headingMatch = trimmedLine.match(/^#{1,2}\s+(.+)$/);

    if (headingMatch && index > 0) {
      // Save the previous section if it has content
      if (currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
          anchorId: currentAnchorId,
        });
      }

      // Start new section
      currentHeading = headingMatch[1];
      currentAnchorId = createAnchorId(currentHeading);
      currentContent = [];
    } else if (trimmedLine) {
      // Add non-empty lines to current content
      currentContent.push(line);
    }
  });

  // Add the last section
  if (currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
      anchorId: currentAnchorId,
    });
  }

  // If no sections were found, create one section with the entire content
  if (sections.length === 0) {
    sections.push({
      heading: chapterHeading,
      content: content,
      anchorId: createAnchorId(chapterHeading),
    });
  }

  return sections;
}

// Create a short excerpt from content
function createExcerpt(content: string, maxLength: number): string {
  // Use the shared cleaning function
  const cleanContent = cleanMarkdownContent(content);

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSentence > maxLength - 50) {
    return cleanContent.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength - 20) {
    return cleanContent.substring(0, lastSpace) + '...';
  } else {
    return cleanContent.substring(0, maxLength) + '...';
  }
}

// Perform search and return results with excerpts
export function performSearch(
  query: string,
  searchIndex: SearchIndex,
  limit: number = 10
): SearchResult[] {
  if (!query.trim() || query.trim().length < 3) {
    return [];
  }

  try {
    // Perform the search
    const results = searchIndex.index.search(query, { limit });

    // Map results to full data
    return results
      .map((id: unknown) => {
        const item = searchIndex.data[parseInt(id as string)];
        if (!item) return null;

        // Create a highlighted excerpt around the search term
        const highlightedExcerpt = createHighlightedExcerpt(
          item.content,
          query
        );

        return {
          ...item,
          excerpt: highlightedExcerpt || item.excerpt,
        };
      })
      .filter((item): item is SearchResult => item !== null);
  } catch (error) {
    logError('Search error', error, {
      component: 'search',
      action: 'perform_search',
      data: { query, limit },
    });
    return [];
  }
}

// Create an excerpt with highlighted search terms
function createHighlightedExcerpt(content: string, query: string): string {
  const cleanContent = cleanMarkdownContent(content);

  // Find the first occurrence of any search term
  const searchTerms = query.toLowerCase().split(/\s+/);
  let firstMatchIndex = -1;

  for (const term of searchTerms) {
    const index = cleanContent.toLowerCase().indexOf(term);
    if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
      firstMatchIndex = index;
    }
  }

  if (firstMatchIndex === -1) {
    return createExcerpt(cleanContent, 250);
  }

  // Create excerpt around the match with more context
  const excerptLength = 300;
  const beforeMatch = 100;

  const start = Math.max(0, firstMatchIndex - beforeMatch);
  const end = Math.min(cleanContent.length, start + excerptLength);

  let excerpt = cleanContent.substring(start, end);

  // Try to start and end at word boundaries
  if (start > 0) {
    const firstSpace = excerpt.indexOf(' ');
    if (firstSpace > 0 && firstSpace < 20) {
      excerpt = excerpt.substring(firstSpace + 1);
    }
    excerpt = '...' + excerpt;
  }

  if (end < cleanContent.length) {
    const lastSpace = excerpt.lastIndexOf(' ');
    if (lastSpace > excerpt.length - 20) {
      excerpt = excerpt.substring(0, lastSpace);
    }
    excerpt = excerpt + '...';
  }

  return excerpt;
}
