import React from 'react';
import { siteConfig } from '@/lib/config';
import {
  getTableOfContentsBreadcrumbs,
  generateStructuredStaticBreadcrumbs,
} from '@/lib/breadcrumbs';

export const metadata = {
  title: `Table of Contents - ${siteConfig.title}`,
  description: `All chapters in "${siteConfig.title}" for search engines.`,
  keywords: [
    'table of contents',
    'chapter list',
    'book chapters',
    'design book chapters',
    'design thinking chapters',
    ...siteConfig.content.defaultKeywords,
    'table',
    'contents',
    'chapter',
    'list',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: `${siteConfig.primaryDomain}/table-of-contents`,
  },
  other: {
    'content-language': 'en',
    'revisit-after': '7 days',
  },
};

import { getAllChapters, type Chapter } from '@/lib/chapters';

// Dynamic chapter list from content files
const allChapters = await getAllChapters();
const chapters = allChapters.map((chapter: Chapter) => ({
  slug: chapter.slug,
  title: chapter.chapter,
}));

export default function TableOfContentsPage() {
  const breadcrumbs = getTableOfContentsBreadcrumbs();
  const structuredBreadcrumbs =
    generateStructuredStaticBreadcrumbs(breadcrumbs);
  const tableOfContentsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TableOfContents',
    name: 'Table of Contents',
    about: {
      '@type': 'Book',
      name: siteConfig.book.title,
      author: {
        '@type': 'Person',
        name: siteConfig.author,
        url: siteConfig.authorUrl,
      },
      genre: siteConfig.book.genre,
      educationalLevel: siteConfig.book.educationalLevel.toLowerCase(),
      publisher: {
        '@type': 'Person',
        name: siteConfig.publisher,
        url: siteConfig.authorUrl,
      },
    },
    hasPart: chapters.map(chapter => ({
      '@type': 'Chapter',
      name: chapter.title,
      url: `${siteConfig.primaryDomain}/${chapter.slug}`,
    })),
  };
  return (
    <>
      {}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredBreadcrumbs),
        }}
      />
      {}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(tableOfContentsJsonLd),
        }}
      />
      <h1>Table of Contents</h1>
      <p>All chapters in &quot;{siteConfig.title}&quot;:</p>
      <ul>
        {chapters.map(chapter => (
          <li key={chapter.slug}>
            <a href={`/${chapter.slug}`}>{chapter.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
