import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { getChapterImage } from './imageMapping';
import {
  processMarkdownToHTML,
  splitContentIntoChunks,
} from './serverMarkdown';
import { siteConfig } from './config';

// Helper to get file modification time
function getFileModificationTime(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch {
    // Fallback to current time if file doesn't exist
    return new Date().toISOString();
  }
}

// Helper to parse frontmatter and content
function parseChapterMarkdown(md: string) {
  const partMatch = md.match(/Part: ([^\n]+)/);
  const keyImageMatch = md.match(/KeyImage: ([^\n]+)/);
  const imageAuthorMatch = md.match(/ImageAuthor: ([^\n]+)/);
  const imageUrlMatch = md.match(/ImageUrl: ([^\n]+)/);
  const chapterMatch = md.match(/Chapter: ([^\n]+)/);
  const quoteMatch = md.match(/Quote: ([^\n]+)/);
  const quoteAuthorMatch = md.match(/Quote Author: ([^\n]+)/);
  const keywordsMatch = md.match(/Keywords: ([^\n]+)/);
  const orderMatch = md.match(/Order: (\d+)/);
  const audioFileMatch = md.match(/AudioFile: ([^\n]+)/);
  const audioTextMatch = md.match(/AudioText: ([^\n]+)/);
  const contentMatch = md.match(/---\n([\s\S]*)/);

  return {
    part: partMatch ? partMatch[1].trim() : '',
    keyImage: keyImageMatch ? keyImageMatch[1].trim() : '',
    imageAuthor: imageAuthorMatch ? imageAuthorMatch[1].trim() : '',
    imageUrl: imageUrlMatch ? imageUrlMatch[1].trim() : '',
    chapter: chapterMatch ? chapterMatch[1].trim() : '',
    quote: quoteMatch ? quoteMatch[1].trim() : '',
    quoteAuthor: quoteAuthorMatch ? quoteAuthorMatch[1].trim() : '',
    keywords: keywordsMatch
      ? keywordsMatch[1].split(',').map(k => k.trim())
      : undefined,
    order: orderMatch ? parseInt(orderMatch[1]) : 999,
    audioFile: audioFileMatch ? audioFileMatch[1].trim() : '',
    audioText: audioTextMatch ? audioTextMatch[1].trim() : '',
    content: contentMatch ? contentMatch[1].trim() : '',
  };
}

export interface Chapter {
  slug: string;
  part: string;
  keyImage: string;
  imageAuthor?: string;
  imageUrl?: string;
  chapter: string;
  quote: string;
  quoteAuthor: string;
  order: number;
  audioFile: string;
  audioText: string;
  content: string;
  htmlContent?: string; // Pre-processed HTML content
  firstChunk?: string; // First chunk for immediate rendering
  remainingChunks?: string[]; // Remaining chunks for progressive loading
  keywords?: string[]; // Optional custom keywords to override automatic extraction
  modifiedTime?: string; // File modification time
}

export interface NavItem {
  part: string;
  chapters: { slug: string; title: string; order: number }[];
}

// Hardcoded part order
const PART_ORDER = [
  'Part I: GETTING STARTED',
  'Part II: ADVANCED FEATURES',
];

// Get a single chapter efficiently (cached)
export const getChapter = cache(
  async (slug: string): Promise<Chapter | null> => {
    const contentDir = path.join(process.cwd(), 'src/content');
    const filePath = path.join(contentDir, `${slug}.md`);

    try {
      const md = fs.readFileSync(filePath, 'utf8');
      const parsed = parseChapterMarkdown(md);

      // Use the new image mapping based on chapter order
      const chapterImage = getChapterImage(parsed.order);

      // Process markdown to HTML (cached to avoid repeated processing)
      const htmlContent = await processMarkdownToHTML(parsed.content);
      const chunks = splitContentIntoChunks(htmlContent);
      const firstChunk = chunks.firstChunk;
      const remainingChunks = chunks.remainingChunks;

      return {
        slug,
        ...parsed,
        keyImage: chapterImage, // Override with the mapped image
        htmlContent, // Pre-processed HTML
        firstChunk, // First chunk for immediate rendering
        remainingChunks, // Remaining chunks for progressive loading
        modifiedTime: getFileModificationTime(filePath),
      };
    } catch (error) {
      console.error(`Error loading chapter ${slug}:`, error);
      return null;
    }
  }
);

// Get all chapters' data (cached) - only used for navigation and metadata
export const getAllChapters = cache(async (): Promise<Chapter[]> => {
  const contentDir = path.join(process.cwd(), 'src/content');

  // Use a more efficient file reading approach
  const files = fs.readdirSync(contentDir);
  const markdownFiles = files.filter(f => f.endsWith('.md') && f !== 'home.md');

  const chapters = await Promise.all(
    markdownFiles.map(async f => {
      const slug = f.replace(/\.md$/, '');
      const filePath = path.join(contentDir, f);
      const md = fs.readFileSync(filePath, 'utf8');
      const parsed = parseChapterMarkdown(md);

      // Use the new image mapping based on chapter order
      const chapterImage = getChapterImage(parsed.order);

      return {
        slug,
        ...parsed,
        keyImage: chapterImage, // Override with the mapped image
        modifiedTime: getFileModificationTime(filePath),
      };
    })
  );

  // Sort by part order, then by chapter order
  return chapters.sort((a, b) => {
    const partA = PART_ORDER.indexOf(a.part);
    const partB = PART_ORDER.indexOf(b.part);
    if (partA !== partB) return partA - partB;

    // If same part, sort by order field
    return a.order - b.order;
  });
});

// Get all chapters with HTML content (only when needed)
export const getAllChaptersWithHTML = cache(async (): Promise<Chapter[]> => {
  const contentDir = path.join(process.cwd(), 'src/content');

  // Use a more efficient file reading approach
  const files = fs.readdirSync(contentDir);
  const markdownFiles = files.filter(f => f.endsWith('.md') && f !== 'home.md');

  const chapters = await Promise.all(
    markdownFiles.map(async f => {
      const slug = f.replace(/\.md$/, '');
      const filePath = path.join(contentDir, f);
      const md = fs.readFileSync(filePath, 'utf8');
      const parsed = parseChapterMarkdown(md);

      // Use the new image mapping based on chapter order
      const chapterImage = getChapterImage(parsed.order);

      // Process markdown to HTML (cached to avoid repeated processing)
      const htmlContent = await processMarkdownToHTML(parsed.content);
      const chunks = splitContentIntoChunks(htmlContent);
      const firstChunk = chunks.firstChunk;
      const remainingChunks = chunks.remainingChunks;

      return {
        slug,
        ...parsed,
        keyImage: chapterImage, // Override with the mapped image
        htmlContent, // Pre-processed HTML
        firstChunk, // First chunk for immediate rendering
        remainingChunks, // Remaining chunks for progressive loading
        modifiedTime: getFileModificationTime(filePath),
      };
    })
  );

  // Sort by part order, then by chapter order
  return chapters.sort((a, b) => {
    const partA = PART_ORDER.indexOf(a.part);
    const partB = PART_ORDER.indexOf(b.part);
    if (partA !== partB) return partA - partB;

    // If same part, sort by order field
    return a.order - b.order;
  });
});

// Get navigation items grouped by part (cached) - lightweight version
export const getNavItems = cache(async (): Promise<NavItem[]> => {
  const contentDir = path.join(process.cwd(), 'src/content');
  const files = fs.readdirSync(contentDir);
  const markdownFiles = files.filter(f => f.endsWith('.md') && f !== 'home.md');

  // Only parse the minimal data needed for navigation
  const chapters = markdownFiles.map(f => {
    const slug = f.replace(/\.md$/, '');
    const filePath = path.join(contentDir, f);
    const md = fs.readFileSync(filePath, 'utf8');

    // Quick regex parsing for navigation data only
    const chapterMatch = md.match(/Chapter: ([^\n]+)/);
    const orderMatch = md.match(/Order: (\d+)/);
    const partMatch = md.match(/Part: ([^\n]+)/);

    return {
      slug,
      chapter: chapterMatch ? chapterMatch[1].trim() : '',
      order: orderMatch ? parseInt(orderMatch[1]) : 999,
      part: partMatch ? partMatch[1].trim() : '',
    };
  });

  // Sort by part order, then by chapter order
  const sortedChapters = chapters.sort((a, b) => {
    const partA = PART_ORDER.indexOf(a.part);
    const partB = PART_ORDER.indexOf(b.part);
    if (partA !== partB) return partA - partB;
    return a.order - b.order;
  });

  // Group chapters by part
  const grouped = sortedChapters.reduce(
    (acc, chapter) => {
      if (!acc[chapter.part]) {
        acc[chapter.part] = [];
      }
      acc[chapter.part].push({
        slug: chapter.slug,
        title: chapter.chapter,
        order: chapter.order,
      });
      return acc;
    },
    {} as Record<string, { slug: string; title: string; order: number }[]>
  );

  // Convert to array format and sort by hardcoded part order
  const navItems = PART_ORDER.filter(part => grouped[part]) // Only include parts that have chapters
    .map(part => ({
      part,
      chapters: grouped[part].sort((a, b) => a.order - b.order), // Sort chapters by order within each part
    }));

  // Add the About page as a special section after all chapters
  navItems.push({
    part: 'ABOUT',
    chapters: [
      {
        slug: 'about',
        title: `About ${siteConfig.title}`,
        order: 999, // High order number to ensure it appears last
      },
    ],
  });

  return navItems;
});

// Get all chapter slugs for static generation (cached)
export const getAllChapterSlugs = cache((): string[] => {
  const contentDir = path.join(process.cwd(), 'src/content');
  const files = fs.readdirSync(contentDir);
  return files
    .filter(f => f.endsWith('.md') && f !== 'home.md')
    .map(f => f.replace(/\.md$/, ''));
});

// Get navigation data only (no HTML processing)
export const getNavigationData = cache(
  async (
    slug: string
  ): Promise<{
    prevChapter: { slug: string; chapter: string } | null;
    nextChapter: { slug: string; chapter: string } | null;
  }> => {
    const contentDir = path.join(process.cwd(), 'src/content');
    const files = fs.readdirSync(contentDir);
    const markdownFiles = files.filter(
      f => f.endsWith('.md') && f !== 'home.md'
    );

    // Only parse the minimal data needed for navigation
    const chapters = markdownFiles.map(f => {
      const slug = f.replace(/\.md$/, '');
      const filePath = path.join(contentDir, f);
      const md = fs.readFileSync(filePath, 'utf8');

      // Quick regex parsing for navigation data only
      const chapterMatch = md.match(/Chapter: ([^\n]+)/);
      const orderMatch = md.match(/Order: (\d+)/);
      const partMatch = md.match(/Part: ([^\n]+)/);

      return {
        slug,
        chapter: chapterMatch ? chapterMatch[1].trim() : '',
        order: orderMatch ? parseInt(orderMatch[1]) : 999,
        part: partMatch ? partMatch[1].trim() : '',
      };
    });

    // Sort by part order, then by chapter order
    const sortedChapters = chapters.sort((a, b) => {
      const partA = PART_ORDER.indexOf(a.part);
      const partB = PART_ORDER.indexOf(b.part);
      if (partA !== partB) return partA - partB;
      return a.order - b.order;
    });

    const currentIndex = sortedChapters.findIndex(c => c.slug === slug);
    const prevChapter =
      currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
    const nextChapter =
      currentIndex < sortedChapters.length - 1
        ? sortedChapters[currentIndex + 1]
        : null;

    return {
      prevChapter: prevChapter
        ? { slug: prevChapter.slug, chapter: prevChapter.chapter }
        : null,
      nextChapter: nextChapter
        ? { slug: nextChapter.slug, chapter: nextChapter.chapter }
        : null,
    };
  }
);
