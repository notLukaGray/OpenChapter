import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '../lib/config';
import Breadcrumbs from '../components/Breadcrumbs';

import {
  getHomeBreadcrumbs,
  generateStructuredStaticBreadcrumbs,
} from '../lib/breadcrumbs';
import '../styles/page-styles.css';
import '../styles/print.css';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    ...siteConfig.content.defaultKeywords,
    'design thinking book',
    'strategic design guide',
    'design education resource',
    'creative process book',
    'design strategy guide',
    'design thinking',
    'strategic design',
    'creative process',
    'design education',
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.publisher,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.primaryDomain,
    type: 'website',
    images: [
      {
        url: '/images/book_cover.webp',
        width: 400,
        height: 520,
        alt: `${siteConfig.title} - Book Cover`,
      },
    ],
  },
  alternates: {
    canonical: siteConfig.primaryDomain,
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

// Homepage content
const quote1 = "Create interactive web books...";
const publisher1 = '';
const image = '/images/book_cover.webp';
const quote2 = '...with audio narration and modern design.';
const publisher2 = '';
const footer = `${siteConfig.author} - Open Source`;

export default function HomePage() {
  const breadcrumbs = getHomeBreadcrumbs();
  const structuredBreadcrumbs =
    generateStructuredStaticBreadcrumbs(breadcrumbs);
  return (
    <>
      {/* Preload the book cover image for better LCP performance */}
      <link
        rel="preload"
        as="image"
        href="/images/book_cover.webp"
        type="image/webp"
      />
      <main className="min-h-screen bg-[#dfdfdf] flex flex-col px-2 py-16 overflow-x-hidden page-container">
        {}
        {breadcrumbs.length > 1 && (
          <div className="w-full max-w-5xl mx-auto mb-4">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        )}
        {}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredBreadcrumbs),
          }}
        />
        <h1 className="sr-only">{siteConfig.title} - Interactive Web Books</h1>

        <div className="flex-1 mx-auto flex flex-col lg:flex-row justify-center items-center lg:h-full w-full lg:gap-8">
          {}
          <div className="h-10 lg:hidden"></div>

          {}
          <div className="flex flex-col items-center justify-center text-center lg:flex-1">
            <div className="max-w-[240px]">
              <div className="quote-text leading-relaxed page-quote-text">
                {quote1}
              </div>
              <div className="quote-publisher text-xs lg:text-sm">
                {publisher1}
              </div>
            </div>
          </div>

          {}
          <div className="min-h-[32px] lg:hidden"></div>

          {}
          <div className="flex flex-col items-center justify-center lg:flex-1">
            <div className="my-8 lg:my-0">
              <Link href="/introduction" className="cursor-pointer">
                <div className="cover-shadow hover:scale-110 transition-all duration-300">
                  <Image
                    src={image}
                    alt="Book Cover"
                    width={400}
                    height={520}
                    className="w-[280px] h-[364px] lg:w-[400px] lg:h-[520px] object-cover hover:opacity-90 transition-all duration-300"
                    draggable={false}
                    priority
                    unoptimized={true}
                    quality={90}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
              </Link>
            </div>
          </div>

          {}
          <div className="min-h-[32px] lg:hidden"></div>

          {}
          <div className="flex flex-col items-center justify-center text-center lg:flex-1">
            <div className="max-w-[240px]">
              <div className="quote-text leading-relaxed page-quote-text">
                {quote2}
              </div>
              <div className="quote-publisher text-xs lg:text-sm">
                {publisher2}
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full text-center footer mt-auto mb-16 pt-24">
          {footer}
        </footer>
      </main>
    </>
  );
}
