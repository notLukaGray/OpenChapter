import '../styles/globals.css';
import '../styles/fonts.css';
import NavMenu from '../components/NavMenu';
import { getNavItems } from '../lib/chapters';
import { siteConfig } from '../lib/config';
import { GoogleAnalytics } from '@next/third-parties/google';

// Fonts are now loaded via CSS in fonts.css

export const metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.primaryDomain),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // themeColor: '#dfdfdf', // Removed as per Next.js 15+ requirements
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.primaryDomain,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.content.defaultImage,
        width: 180,
        height: 180,
        alt: `${siteConfig.title} - Book Cover`,
      },
    ],
  },
  // Twitter Card removed - no Twitter account
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
    'msvalidate.01': '30C80AE81BD7AF50BF9D005609FD1A54', // Bing verification
  },
};

// Add viewport export for theme color
export function generateViewport() {
  return {
    themeColor: '#dfdfdf',
    width: 'device-width',
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await getNavItems();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        {/* KaTeX CSS for math rendering - load early */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
          integrity="sha384-6LkG2lYjKJSiF/3jqElZT6F2O2fUznL1g3/J3oJ2Yl3q/GeqM+9dIGJw4J8+kt"
          crossOrigin="anonymous"
        />
        
        {/* Critical CSS to reduce render-blocking */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --font-serif: 'Lora', Georgia, serif;
              --font-mono: 'IBM Plex Mono', Courier, monospace;
              --font-sans: 'Inter', 'Montserrat', Arial, sans-serif;
              --color-bg: #dfdfdf;
              --color-text: #222;
            }
            body {
              background-color: var(--color-bg);
              color: var(--color-text);
              font-family: var(--font-serif);
              line-height: 1.7;
              margin: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .prose h1 {
              font-family: var(--font-sans);
              font-weight: 900;
              font-size: 3rem;
              color: var(--color-text);
              letter-spacing: -0.03em;
              line-height: 1;
              margin-top: 2.5rem;
              margin-bottom: 1.5rem;
            }
            .prose h2 {
              font-family: var(--font-sans);
              font-weight: 700;
              font-size: 2rem;
              color: var(--color-text);
              line-height: 1.2;
              letter-spacing: -0.01em;
              margin-top: 2rem;
              margin-bottom: 1.2rem;
            }
          `,
          }}
        />

        {/* Preload critical fonts to reduce render-blocking */}
        <link
          rel="preload"
          href="/fonts/inter-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/lora-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Local fonts are loaded via CSS */}

        {}

        {}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Podcast Feed"
          href="/podcast.xml"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Book',
                name: siteConfig.structuredData.book.name,
                description: siteConfig.structuredData.book.description,
                author: {
                  '@type': 'Person',
                  name: siteConfig.author,
                },
                publisher: {
                  '@type': 'Person',
                  name: siteConfig.publisher,
                },
                url: siteConfig.primaryDomain,
                isbn: siteConfig.structuredData.book.isbn,
                genre: siteConfig.structuredData.book.genre,
                audience: siteConfig.structuredData.book.audience,
                educationalLevel:
                  siteConfig.structuredData.book.educationalLevel,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: siteConfig.structuredData.website.name,
                url: siteConfig.primaryDomain,
                description: siteConfig.structuredData.website.description,
                author: {
                  '@type': 'Person',
                  name: siteConfig.author,
                },
                inLanguage: siteConfig.structuredData.website.inLanguage,
                copyrightYear: siteConfig.structuredData.website.copyrightYear,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: siteConfig.structuredData.organization.name,
                url: siteConfig.primaryDomain,
                logo: siteConfig.structuredData.organization.logo,
                sameAs: siteConfig.structuredData.organization.sameAs,
              },
            ]),
          }}
        />
      </head>
      <body className="antialiased bg-[#dfdfdf] text-[#222]">
        <NavMenu navItems={navItems} />
        {children}
        <GoogleAnalytics gaId={siteConfig.analytics.googleAnalyticsId} />
      </body>
    </html>
  );
}
