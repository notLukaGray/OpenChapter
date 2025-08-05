export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import IndexNowAdminClient from './IndexNowAdminClient';
import {
  getAdminBreadcrumbs,
  generateStructuredStaticBreadcrumbs,
} from '../../../lib/breadcrumbs';

export const metadata: Metadata = {
  title: `IndexNow Admin - ${siteConfig.title}`,
  description: 'Admin interface for IndexNow URL submission',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Explicitly disable canonical tags for admin pages
  alternates: {
    canonical: null,
  },
};

export default function Page() {
  const breadcrumbs = getAdminBreadcrumbs();
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
      <Suspense fallback={<div>Loading...</div>}>
        <IndexNowAdminClient />
      </Suspense>
    </>
  );
}
