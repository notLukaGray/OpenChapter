export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import SearchClientPage from './SearchClientPage';
import {
  getSearchBreadcrumbs,
  generateStructuredStaticBreadcrumbs,
} from '../../lib/breadcrumbs';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: `Search - ${siteConfig.title}`,
  description: `Search through all chapters and content in "${siteConfig.title}" - a comprehensive guide to strategic design thinking.`,
  keywords: [
    'search',
    'design thinking book',
    'chapter search',
    'content search',
    ...siteConfig.content.defaultKeywords,
    'design education',
    'strategic design',
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.publisher,
  openGraph: {
    title: `Search - ${siteConfig.title}`,
    description: `Search through all chapters and content in "${siteConfig.title}"`,
    url: `${siteConfig.primaryDomain}/search`,
    type: 'website',
    images: [
      {
        url: siteConfig.content.defaultImage,
        width: 180,
        height: 180,
        alt: `Search - ${siteConfig.title}`,
      },
    ],
  },
  alternates: {
    canonical: `${siteConfig.primaryDomain}/search`,
  },
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
  other: {
    'content-language': 'en',
    'revisit-after': '7 days',
  },
};

export default function SearchPage() {
  const breadcrumbs = getSearchBreadcrumbs();
  const structuredBreadcrumbs =
    generateStructuredStaticBreadcrumbs(breadcrumbs);
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredBreadcrumbs),
        }}
      />
      <SearchClientPage />
    </>
  );
}
