import { getAllChapters, type Chapter } from '@/lib/chapters';
import { siteConfig } from '@/lib/config';
import { AUDIO_CONFIG } from '@/lib/audio-config';
import {
  chapterDescriptions,
  chapterCategories,
} from '@/lib/chapterDescriptions';

// Function to escape XML entities
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Function to get file size for audio files
function getAudioFileSize(audioFile: string): number {
  if (!audioFile) return 0;
  return AUDIO_CONFIG.getFileSize(audioFile);
}

export async function GET() {
  const chapters = await getAllChapters();
  const baseUrl = siteConfig.primaryDomain;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${siteConfig.title}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <managingEditor>${siteConfig.email} (${siteConfig.author})</managingEditor>
    <webMaster>${siteConfig.email} (${siteConfig.author})</webMaster>
    <itunes:author>${siteConfig.author}</itunes:author>
    <itunes:summary>${escapeXml('A practical, honest guide to bridging the gap between creative work and real strategy. Learn how to frame problems, defend your ideas, and build design that actually matters.')}</itunes:summary>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="Education">
      <itunes:category text="Design" />
    </itunes:category>
    <image>
      <url>${baseUrl}${siteConfig.content.defaultImage}</url>
      <title>${siteConfig.title}</title>
      <link>${baseUrl}</link>
      <width>180</width>
      <height>180</height>
    </image>
    <sy:updatePeriod>weekly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    ${chapters
      .map((chapter: Chapter) => {
        const audioUrl = chapter.audioFile
          ? `${baseUrl}${chapter.audioFile}`
          : '';
        const audioSize = getAudioFileSize(chapter.audioFile);
        const audioEnclosure = audioUrl
          ? `
      <enclosure url="${audioUrl}" length="${audioSize}" type="audio/mpeg" />
      <itunes:duration>${chapter.audioText || 'Unknown'}</itunes:duration>`
          : '';

        return `
    <item>
      <title>Chapter ${chapter.order}: ${escapeXml(chapter.chapter)}</title>
      <description>${escapeXml(chapterDescriptions[chapter.slug] || '')}</description>
      <link>${baseUrl}/${chapter.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${chapter.slug}</guid>
      <pubDate>2024-01-01T00:00:00Z</pubDate>
      <dc:creator>${siteConfig.author}</dc:creator>
      <dc:date>2024-01-01T00:00:00Z</dc:date>
      <content:encoded><![CDATA[${chapterDescriptions[chapter.slug] || ''}]]></content:encoded>${audioEnclosure}
      ${(chapterCategories[chapter.slug] || ['Design']).map(cat => `<category>${escapeXml(cat)}</category>`).join('\n      ')}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
