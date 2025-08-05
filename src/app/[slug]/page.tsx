import React from 'react';
import {
  getAllChapterSlugs,
  getChapter,
  getNavigationData,
} from '@/lib/chapters';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import { generateKeywordsForChapter } from '@/lib/keywords';
import { generateStructuredBreadcrumbs } from '@/lib/breadcrumbs';
import {
  chapterDescriptions,
  chapterCategories,
} from '@/lib/chapterDescriptions';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ImageAttribution from '@/components/ImageAttribution';
import { getChapterImage } from '@/lib/imageMapping';
import PrintCSSLoader from '@/components/PrintCSSLoader';
import '@/styles/components.css';
// Removed page-styles.css and print.css from critical path - consolidated and loaded on demand

// Lazy load non-critical components with better loading states
const ShareButton = dynamic(() => import('@/components/ShareButton'), {
  loading: () => (
    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
  ),
  ssr: true, // Enable SSR for better performance
});

const AudioPlayerWrapper = dynamic(
  () => import('@/components/AudioPlayerWrapper'),
  {
    loading: () => (
      <div className="w-64 h-12 bg-gray-200 rounded-lg animate-pulse" />
    ),
    ssr: true,
  }
);

// Load StaticHTMLRenderer for server-side processed content
const StaticHTMLRenderer = dynamic(
  () => import('@/components/StaticHTMLRenderer'),
  {
    loading: () => (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    ),
    ssr: true,
  }
);

// Import performance tracking components directly since they're small
import ScrollTracker from '@/components/ScrollTracker';
import PerformanceTracker from '@/components/PerformanceTracker';
import NavigationButtons from '@/components/NavigationButtons';

export async function generateStaticParams() {
  return getAllChapterSlugs().map(slug => ({ slug }));
}

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    return {
      title: 'Chapter Not Found',
      description: 'The requested chapter could not be found.',
    };
  }

  // Generate dynamic keywords
  const keywords = chapter.keywords || generateKeywordsForChapter(chapter);

  return {
    title: chapter.chapter,
    description:
      chapterDescriptions[chapter.slug] ||
      `Chapter ${chapter.order}: ${chapter.chapter} - Strategic design thinking insights for students and educators.`,
    keywords: keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.publisher,
    openGraph: {
      title: chapter.chapter,
      description:
        chapterDescriptions[chapter.slug] ||
        `Chapter ${chapter.order}: ${chapter.chapter}`,
      url: `${siteConfig.primaryDomain}/${slug}`,
      type: 'article',
      images: [
        {
          url: chapter.keyImage || '/apple-touch-icon.png',
          width: 1200,
          height: 630,
          alt: `Chapter ${chapter.order}: ${chapter.chapter}`,
        },
      ],
      publishedTime: '2024-01-01',
      modifiedTime: new Date().toISOString(),
      section: 'Design Education',
      tags: chapterCategories[chapter.slug] || [
        'design thinking',
        'strategic design',
        'education',
      ],
    },
    alternates: {
      canonical: `${siteConfig.primaryDomain}/${slug}`,
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
      'article:author': siteConfig.author,
      'article:section': 'Design Education',
      'article:tag': 'design thinking, strategic design, education',
      'content-language': 'en',
      'revisit-after': '7 days',
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    // This will trigger the not-found.tsx page
    notFound();
  }

  // Preload the LCP image for better performance
  const lcpImage = getChapterImage(chapter.order);

  // Generate dynamic keywords
  const keywords = chapter.keywords || generateKeywordsForChapter(chapter);

  // Get navigation data efficiently (no HTML processing)
  const { prevChapter, nextChapter } = await getNavigationData(slug);

  // Generate dynamic breadcrumbs
  const breadcrumbs = generateStructuredBreadcrumbs(chapter);

  // Generate structured data with proper JSON format
  const generateStructuredData = (): Record<string, unknown>[] => {
    const baseUrl = siteConfig.primaryDomain;
    const chapterUrl = `${baseUrl}/${slug}`;
    const imageUrl = chapter.keyImage
      ? chapter.keyImage.startsWith('http')
        ? chapter.keyImage
        : `${baseUrl}${chapter.keyImage}`
      : `${baseUrl}${siteConfig.content.defaultImage}`;

    const structuredData: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: chapter.chapter,
        description:
          chapterDescriptions[chapter.slug] ||
          `Chapter ${chapter.order}: ${chapter.chapter}`,
        author: {
          '@type': 'Person',
          name: siteConfig.author,
          url: siteConfig.authorUrl,
        },
        publisher: {
          '@type': 'Person',
          name: siteConfig.publisher,
          url: siteConfig.authorUrl,
        },
        datePublished: siteConfig.book.publicationDate,
        dateModified: chapter.modifiedTime || siteConfig.book.publicationDate,
        url: chapterUrl,
        image: imageUrl,
        articleSection: siteConfig.book.articleSection,
        keywords: keywords.join(', '),
        educationalLevel: siteConfig.book.educationalLevel.toLowerCase(),
        audience: {
          '@type': 'Audience',
          audienceType: siteConfig.book.audienceType,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': chapterUrl,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Chapter',
        name: chapter.chapter,
        description:
          chapterDescriptions[chapter.slug] ||
          `Chapter ${chapter.order}: ${chapter.chapter}`,
        position: chapter.order,
        isPartOf: {
          '@type': 'Book',
          name: siteConfig.book.title,
          author: {
            '@type': 'Person',
            name: siteConfig.author,
            url: siteConfig.authorUrl,
          },
        },
        url: chapterUrl,
      },
    ];

    // Add breadcrumbs as a separate object
    structuredData.push(breadcrumbs);

    // Add audio object if audio file exists
    if (chapter.audioFile) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'AudioObject',
        name: `${chapter.chapter} - Audio`,
        description:
          chapterDescriptions[chapter.slug] ||
          `Audio version of Chapter ${chapter.order}: ${chapter.chapter}`,
        contentUrl: `${baseUrl}${chapter.audioFile}`,
        encodingFormat: siteConfig.audio.encodingFormat,
        duration: chapter.audioText || siteConfig.audio.defaultDuration,
        author: {
          '@type': 'Person',
          name: siteConfig.author,
          url: siteConfig.authorUrl,
        },
        publisher: {
          '@type': 'Person',
          name: siteConfig.publisher,
          url: siteConfig.authorUrl,
        },
        datePublished: siteConfig.book.publicationDate,
        isPartOf: {
          '@type': 'Book',
          name: siteConfig.book.title,
          author: {
            '@type': 'Person',
            name: siteConfig.author,
            url: siteConfig.authorUrl,
          },
        },
      });
    }

    return structuredData;
  };

  return (
    <>
      <div className="min-h-screen bg-[#dfdfdf] page-container">
        <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-40px)] gap-0 m-0 px-0">
          {}
          <div className="rounded-none shadow basis-[20%] lg:basis-[40%] h-[20vh] lg:h-auto max-h-[20vh] lg:max-h-none relative page-background">
            <Image
              src={lcpImage}
              alt={`${chapter.chapter} background`}
              fill
              sizes="(max-width: 1024px) 20vw, 40vw"
              className="object-cover"
              priority={true}
              fetchPriority="high"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            <ShareButton chapter={chapter.chapter} chapterSlug={slug} />
            <ImageAttribution
              author={chapter.imageAuthor}
              imageUrl={chapter.imageUrl}
            />
          </div>

          {}
          <div className="flex-1 bg-white rounded-none shadow-lg p-6 overflow-y-auto basis-[80%] lg:basis-[60%] flex flex-col m-0">
            {}
            <div className="page-spacer-100" />

            {}
            {chapter.audioFile && (
              <div className="w-4/5 mx-auto">
                <div className="page-audio-container">
                  <AudioPlayerWrapper
                    src={chapter.audioFile}
                    chapterTitle={chapter.chapter}
                  />
                </div>
              </div>
            )}

            {}
            <div
              className="prose prose-sm md:prose-base max-w-none w-4/5 mx-auto"
              data-chapter-title={chapter.chapter}
            >
              {/* Server-rendered first chunk for immediate LCP */}
              {chapter.firstChunk ? (
                <>
                  <div
                    dangerouslySetInnerHTML={{ __html: chapter.firstChunk }}
                  />
                  {/* Client-side progressive loading for remaining chunks */}
                  {chapter.remainingChunks &&
                    chapter.remainingChunks.length > 0 && (
                      <StaticHTMLRenderer
                        htmlChunks={chapter.remainingChunks}
                      />
                    )}
                </>
              ) : (
                /* Fallback for development mode - simple markdown rendering */
                <div className="whitespace-pre-wrap">{chapter.content}</div>
              )}
            </div>
          </div>

          {}
          <NavigationButtons
            prevChapter={
              prevChapter
                ? { slug: prevChapter.slug, chapter: prevChapter.chapter }
                : undefined
            }
            nextChapter={
              nextChapter
                ? { slug: nextChapter.slug, chapter: nextChapter.chapter }
                : undefined
            }
            currentChapter={chapter.chapter}
          />
        </div>

        {}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData()),
          }}
        />

        {}
        <ScrollTracker chapterTitle={chapter.chapter} chapterSlug={slug} />
        <PerformanceTracker chapterTitle={chapter.chapter} chapterSlug={slug} />
        <PrintCSSLoader />
      </div>
    </>
  );
}
