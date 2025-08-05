import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import Image from 'next/image';
import {
  getAboutBreadcrumbs,
  generateStructuredStaticBreadcrumbs,
} from '../../lib/breadcrumbs';
import { getProfileImage } from '@/lib/imageMapping';
import '../../styles/page-styles.css';
import '../../styles/print.css';

export const metadata: Metadata = {
  title: `About ${siteConfig.author}`,
  description: `Learn about "${siteConfig.title}" and author ${siteConfig.author} - a comprehensive guide to strategic design thinking for students and educators.`,
  keywords: [
    `about ${siteConfig.author}`,
    'author bio',
    ...siteConfig.content.defaultKeywords,
    'author',
    'bio',
    'about',
    'expert',
  ],
  openGraph: {
    title: `About the Book and Author - ${siteConfig.title}`,
    description: `Learn about "${siteConfig.title}" and author ${siteConfig.author}`,
    url: `${siteConfig.primaryDomain}/about`,
    type: 'article',
    images: [
      {
        url: getProfileImage(),
        width: 1200,
        height: 630,
        alt: `About ${siteConfig.author}`,
      },
    ],
  },
  alternates: {
    canonical: `${siteConfig.primaryDomain}/about`,
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

export default function AboutPage() {
  const breadcrumbs = getAboutBreadcrumbs();
  const structuredBreadcrumbs =
    generateStructuredStaticBreadcrumbs(breadcrumbs);
  return (
    <div className="min-h-screen bg-[#dfdfdf] page-container">
      {}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredBreadcrumbs),
        }}
      />
      <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-40px)] gap-0 m-0 px-0">
        {}
        <div className="rounded-none shadow basis-[20%] lg:basis-[40%] h-[20vh] lg:h-auto max-h-[20vh] lg:max-h-none relative overflow-hidden page-background">
          <Image
            src={getProfileImage()}
            alt={`About ${siteConfig.title}`}
            fill
            sizes="(max-width: 1024px) 20vw, 40vw"
            className="object-cover object-center page-image-position"
            priority={false}
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k="
          />
        </div>

        {}
        <div className="flex-1 bg-white rounded-none shadow-lg p-6 overflow-y-auto basis-[80%] lg:basis-[60%] flex flex-col m-0">
          <div className="prose prose-sm md:prose-base max-w-none w-4/5 mx-auto">
            <h1>About {siteConfig.title}</h1>

            <div className="page-spacer-20"></div>

            <p>
              <strong>{siteConfig.title}</strong> – {siteConfig.description}
            </p>

            <div className="page-spacer-20"></div>

            <p>
              {siteConfig.title} was created to make it easy for educators, authors, and content creators
              to build beautiful, interactive web books with audio narration capabilities. 
              Built with modern web technologies like Next.js, Tailwind CSS, and Azure Cognitive Services,
              it provides a complete solution for digital publishing.
            </p>

            <div className="page-spacer-20"></div>

            <p>
              The platform includes features like responsive design, search functionality,
              audio narration, SEO optimization, and accessibility compliance. Whether you're
              creating educational content, documentation, or interactive stories, {siteConfig.title}
              provides the tools you need to create engaging digital experiences.
            </p>

            <div className="page-spacer-20"></div>

            <h2>Why This Platform Exists</h2>

            <div className="page-spacer-20"></div>

            <p>
              Most digital publishing platforms are either too complex or too limited. 
              They either require extensive technical knowledge or lack the features 
              needed for modern digital books. {siteConfig.title} bridges that gap.
            </p>

            <div className="page-spacer-20"></div>

            <p>
              This platform enables you to create beautiful, interactive web books with 
              audio narration, search functionality, and responsive design. No complex setup, 
              no proprietary formats, just a modern web-based solution you can customize and extend.
            </p>

            <div className="page-spacer-20"></div>

            <p>
              Treat this platform like an open-source toolkit, not a closed system. 
              Fork, modify, contribute, repeat. This is how we see digital publishing: 
              take what works, leave what doesn&apos;t, and build your own approach.
            </p>

            <div className="page-spacer-20"></div>

            <p>
              And before you deploy, pause. Ask who will benefit from your content, 
              good or bad. Digital publishing is our way of making knowledge accessible 
              to real people; let&apos;s use that power with purpose.
            </p>

            <div className="page-spacer-20"></div>

            <h2>Essential Reading</h2>

            <div className="page-spacer-20"></div>

            <h3>FOUNDATIONS</h3>

            <div className="page-spacer-20"></div>

            <ul>
              <li>
                <strong>
                  <em>The Design of Everyday Things</em>
                </strong>{' '}
                by Don Norman – User-centred design basics.
              </li>
              <li>
                <strong>
                  <em>Positioning</em>
                </strong>{' '}
                by Al Ries & Jack Trout – Carving out market space.
              </li>
            </ul>

            <div className="page-spacer-30"></div>

            <h3>CONCEPT & STRATEGY</h3>

            <div className="page-spacer-20"></div>

            <ul>
              <li>
                <strong>
                  <em>A Smile in the Mind</em>
                </strong>{' '}
                by Beryl McAlhone & David Stuart – Idea generation that hits.
              </li>
              <li>
                <strong>
                  <em>Designing Brand Identity</em>
                </strong>{' '}
                by Alina Wheeler – Building and managing brand systems.
              </li>
              <li>
                <strong>
                  <em>Made to Stick</em>
                </strong>{' '}
                by Chip Heath & Dan Heath – Turning messages into stories that
                stay.
              </li>
            </ul>

            <div className="page-spacer-30"></div>

            <h3>PROCESS & CRAFT</h3>

            <div className="page-spacer-20"></div>

            <ul>
              <li>
                <strong>
                  <em>Sprint</em>
                </strong>{' '}
                by Jake Knapp – A five-day framework for solving product
                problems.
              </li>
              <li>
                <strong>
                  <em>Lean UX</em>
                </strong>{' '}
                by Jeff Gothelf – Rapid, test-driven product design.
              </li>
              <li>
                <strong>
                  <em>The Field Study Handbook</em>
                </strong>{' '}
                by Jan Chipchase – In-the-wild research playbook.
              </li>
            </ul>

            <div className="page-spacer-30"></div>

            <h3>SYSTEMS, FUTURES & ETHICS</h3>

            <div className="page-spacer-20"></div>

            <ul>
              <li>
                <strong>
                  <em>Dark Matter & Trojan Horses</em>
                </strong>{' '}
                by Dan Hill – Using design to shift policy and systems.
              </li>
              <li>
                <strong>
                  <em>The Politics of Design</em>
                </strong>{' '}
                by Ruben Pater – Spotting bias in colour, type, and imagery.
              </li>
              <li>
                <strong>
                  <em>Design Justice</em>
                </strong>{' '}
                by Sasha Costanza-Chock – Equity first design practice.
              </li>
            </ul>

            <div className="page-spacer-200"></div>
          </div>
        </div>
      </div>

      {}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: `About ${siteConfig.title}`,
            description: `About the book "${siteConfig.title}" and author ${siteConfig.author}`,
            mainEntity: {
              '@type': 'Book',
              name: siteConfig.book.title,
              author: {
                '@type': 'Person',
                name: siteConfig.author,
              },
              description: siteConfig.structuredData.book.description,
              genre: siteConfig.structuredData.book.genre,
              audience: siteConfig.structuredData.book.audience,
            },
            url: `${siteConfig.primaryDomain}/about`,
          }),
        }}
      />
    </div>
  );
}
