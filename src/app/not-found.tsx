import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { getAllChapters, type Chapter } from '../lib/chapters';
import { siteConfig } from '../lib/config';
import '../styles/page-styles.css';

export const metadata: Metadata = {
  title: `Page Not Found - ${siteConfig.title}`,
  description: 'The page you are looking for could not be found.',
  alternates: {
    canonical: `${siteConfig.primaryDomain}/404`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const chapters = await getAllChapters();

  // Group chapters by part
  const groupedChapters = chapters.reduce(
    (acc: Record<string, Chapter[]>, chapter: Chapter) => {
      if (!acc[chapter.part]) {
        acc[chapter.part] = [];
      }
      acc[chapter.part].push(chapter);
      return acc;
    },
    {} as Record<string, typeof chapters>
  );

  // Define part order
  const partOrder = [
    'INTRODUCTION',
    'Part I: FOUNDATIONS',
    'Part II: BUILDING',
    'Part III: TURNING',
    'Part IV: SELLING',
    'Part V: PRESSURING',
  ];

  return (
    <div className="min-h-screen bg-[#dfdfdf] page-container">
      <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-40px)] gap-0 m-0 px-0">
        {}
        <div className="rounded-none shadow basis-[20%] lg:basis-[40%] h-[20vh] lg:h-auto max-h-[20vh] lg:max-h-none relative overflow-hidden page-background">
          <Image
            src="/images/404.webp"
            alt="404 background"
            fill
            sizes="(max-width: 1024px) 20vw, 40vw"
            className="object-cover opacity-60"
            priority={false}
            quality={80}
          />
        </div>

        {}
        <div className="flex-1 bg-white rounded-none shadow-lg p-6 overflow-y-auto basis-[80%] lg:basis-[60%] flex flex-col m-0 page-content-bottom">
          {}
          <div className="page-spacer-100" />

          {}
          <div className="prose prose-sm md:prose-base max-w-none w-4/5 mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-light text-gray-800 mb-6">
                Page Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The page you are looking for doesn&apos;t exist or has been
                moved.
              </p>

              <div className="space-y-4">
                <Link
                  href="/"
                  className="inline-block bg-[#b95b23] text-white px-6 py-3 rounded-lg hover:bg-[#a04a1a] transition-colors duration-200"
                >
                  Return to Home
                </Link>

                <div className="text-sm text-gray-500 mt-8">
                  <p className="mb-4">
                    You might want to try one of these chapters:
                  </p>
                  <div className="space-y-6">
                    {partOrder
                      .filter(part => groupedChapters[part])
                      .map(part => (
                        <div key={part} className="text-center">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {part}
                          </h3>
                          <div className="space-y-1">
                            {groupedChapters[part].map((chapter: Chapter) => (
                              <div key={chapter.slug}>
                                <Link
                                  href={`/${chapter.slug}`}
                                  className="text-gray-800 hover:text-[#b95b23] hover:underline text-sm"
                                >
                                  {chapter.chapter || chapter.slug}
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
