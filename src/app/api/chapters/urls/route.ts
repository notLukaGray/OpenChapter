import { NextResponse } from 'next/server';
import { getAllChapters, type Chapter } from '@/lib/chapters';
import { siteConfig } from '@/lib/config';

export async function GET() {
  try {
    const chapters = await getAllChapters();
    const urls = chapters.map(
      (chapter: Chapter) => `${siteConfig.primaryDomain}/${chapter.slug}`
    );
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get chapter URLs' },
      { status: 500 }
    );
  }
}
