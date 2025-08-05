import { NextRequest } from 'next/server';
import { getAllChapters, type Chapter } from '@/lib/chapters';
import { generateKeywordsForChapter } from '@/lib/keywords';

export async function GET(req: NextRequest) {
  // Extract slug from the URL
  const url = new URL(req.url);
  const slug = url.pathname.split('/').filter(Boolean).pop();

  const chapters = await getAllChapters();
  const chapter = chapters.find((c: Chapter) => c.slug === slug);

  if (!chapter) {
    return new Response(JSON.stringify({ error: 'Chapter not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const keywords = chapter.keywords || generateKeywordsForChapter(chapter);

  return new Response(JSON.stringify({ slug, keywords }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
