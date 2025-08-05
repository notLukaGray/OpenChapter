import { MetadataRoute } from 'next';
import { getAllChapters, Chapter } from '../lib/chapters';
import { siteConfig } from '../lib/config';
import { cache } from 'react';

// Cache the sitemap generation
const generateSitemap = cache(async (): Promise<MetadataRoute.Sitemap> => {
  const chapters = getAllChapters();
  const baseUrl = siteConfig.primaryDomain;

  // Static pages (only finished ones)
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/table-of-contents`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];

  // Chapter pages
  const chapterPages = (await chapters).map((chapter: Chapter) => ({
    url: `${baseUrl}/${chapter.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...chapterPages];
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await generateSitemap();
}
