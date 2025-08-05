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
  const chapters = (await getAllChapters()).filter(
    (chapter: Chapter) => chapter.audioFile
  ); // Only chapters with audio
  const baseUrl = siteConfig.primaryDomain;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${AUDIO_CONFIG.podcast.title}</title>
    <description>${escapeXml(AUDIO_CONFIG.podcast.description)}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/podcast.xml" rel="self" type="application/rss+xml" />
    <language>${AUDIO_CONFIG.podcast.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>1440</ttl>
    <managingEditor>${AUDIO_CONFIG.podcast.email} (${AUDIO_CONFIG.podcast.author})</managingEditor>
    <webMaster>${AUDIO_CONFIG.podcast.email} (${AUDIO_CONFIG.podcast.author})</webMaster>
    <itunes:author>${AUDIO_CONFIG.podcast.author}</itunes:author>
    <itunes:summary>${escapeXml(`Audio chapters from "${siteConfig.title}" - learn design strategy on the go.`)}</itunes:summary>
    <itunes:explicit>${AUDIO_CONFIG.podcast.explicit}</itunes:explicit>
    <itunes:type>${AUDIO_CONFIG.podcast.type}</itunes:type>
    <itunes:category text="${AUDIO_CONFIG.podcast.category}">
      <itunes:category text="${AUDIO_CONFIG.podcast.subcategory}" />
    </itunes:category>
    <itunes:owner>
      <itunes:name>${AUDIO_CONFIG.podcast.author}</itunes:name>
      <itunes:email>${AUDIO_CONFIG.podcast.email}</itunes:email>
    </itunes:owner>
    <image>
      <url>${baseUrl}${siteConfig.content.defaultImage}</url>
      <title>${AUDIO_CONFIG.podcast.title}</title>
      <link>${baseUrl}</link>
      <width>180</width>
      <height>180</height>
    </image>
    <sy:updatePeriod>${AUDIO_CONFIG.podcast.updatePeriod}</sy:updatePeriod>
    <sy:updateFrequency>${AUDIO_CONFIG.podcast.updateFrequency}</sy:updateFrequency>
    ${chapters
      .map((chapter: Chapter) => {
        const audioUrl = `${baseUrl}${chapter.audioFile}`;
        const audioSize = getAudioFileSize(chapter.audioFile);

        return `
    <item>
      <title>Chapter ${chapter.order}: ${escapeXml(chapter.chapter)}</title>
      <description>${escapeXml(chapterDescriptions[chapter.slug] || '')}</description>
      <link>${baseUrl}/${chapter.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${chapter.slug}</guid>
      <pubDate>2024-01-01T00:00:00Z</pubDate>
      <dc:creator>${siteConfig.author}</dc:creator>
      <dc:date>2024-01-01T00:00:00Z</dc:date>
      <content:encoded><![CDATA[${chapterDescriptions[chapter.slug] || ''}]]></content:encoded>
      <enclosure url="${audioUrl}" length="${audioSize}" type="audio/mpeg" />
      <itunes:duration>${chapter.audioText || 'Unknown'}</itunes:duration>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:episode>${chapter.order}</itunes:episode>
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
