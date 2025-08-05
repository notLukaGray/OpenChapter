// Server-only IndexNow utilities
export async function submitAllChaptersToIndexNow() {
  const { getAllChapters } = await import('./chapters');
  const { siteConfig } = await import('./config');
  const { submitToIndexNow } = await import('./indexnow.client');

  const chapters = await getAllChapters();
  const urls = chapters.map(
    chapter => `${siteConfig.primaryDomain}/${chapter.slug}`
  );

  return submitToIndexNow(urls);
}
