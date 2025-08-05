import { Chapter } from './chapters';
import { generateKeywordsForChapter } from './keywords';

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
  keywords?: string[]; // Add keywords for enhanced SEO
}

// Enhanced breadcrumb names using keyword strategy
function getEnhancedBreadcrumbName(
  chapter: Chapter,
  type: 'part' | 'chapter'
): string {
  if (type === 'part') {
    // Use part name as-is, but could be enhanced with keywords
    return chapter.part;
  }

  // For chapter names, we could enhance with keywords, but let's keep it clean
  // The chapter title is already keyword-optimized
  return chapter.chapter;
}

export function generateBreadcrumbsForChapter(
  chapter: Chapter
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      url: '/',
      position: 1,
      keywords: siteConfig.content.defaultKeywords,
    },
  ];

  // Add part level breadcrumb
  if (chapter.part && chapter.part !== 'INTRODUCTION') {
    const partName = getEnhancedBreadcrumbName(chapter, 'part');
    if (partName && partName.trim()) {
      breadcrumbs.push({
        name: partName,
        url: `/table-of-contents#${chapter.part.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        position: 2,
        keywords: [chapter.part.toLowerCase().replace(/[^a-z0-9]+/g, ' ')],
      });
    }
  }

  // Add chapter breadcrumb with keywords
  const chapterName = getEnhancedBreadcrumbName(chapter, 'chapter');
  if (chapterName && chapterName.trim()) {
    const chapterKeywords = generateKeywordsForChapter(chapter);
    breadcrumbs.push({
      name: chapterName,
      url: `/${chapter.slug}`,
      position: breadcrumbs.length + 1,
      keywords: chapterKeywords.slice(0, 5), // Top 5 keywords for breadcrumb
    });
  }

  return breadcrumbs;
}

// Static breadcrumbs for top-level pages
export function getHomeBreadcrumbs(): BreadcrumbItem[] {
  return [{ name: 'Home', url: '/', position: 1 }];
}

export function getAboutBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/', position: 1 },
    { name: 'About', url: '/about', position: 2 },
  ];
}

export function getTableOfContentsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/', position: 1 },
    { name: 'Table of Contents', url: '/table-of-contents', position: 2 },
  ];
}

export function getSearchBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/', position: 1 },
    { name: 'Search', url: '/search', position: 2 },
  ];
}

export function getAdminBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/', position: 1 },
    { name: 'Admin', url: '/admin', position: 2 },
  ];
}

import { siteConfig } from './config';

// Structured data for static pages
export function generateStructuredStaticBreadcrumbs(
  breadcrumbs: BreadcrumbItem[]
) {
  const validBreadcrumbs = breadcrumbs.filter(
    item => item.name && item.name.trim() && item.url && item.position > 0
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: validBreadcrumbs.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@id': `${siteConfig.primaryDomain}${item.url}`,
        name: item.name.trim(),
      },
    })),
  };
}

// Structured data for chapter pages
export function generateStructuredBreadcrumbs(chapter: Chapter) {
  const breadcrumbs = generateBreadcrumbsForChapter(chapter);

  // Filter out any breadcrumbs with empty or invalid names
  const validBreadcrumbs = breadcrumbs.filter(
    item => item.name && item.name.trim() && item.url && item.position > 0
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: validBreadcrumbs.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@id': `${siteConfig.primaryDomain}${item.url}`,
        name: item.name.trim(),
      },
    })),
  };
}
