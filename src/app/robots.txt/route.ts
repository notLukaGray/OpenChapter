import { siteConfig } from '@/lib/config';

export async function GET() {
  const robotsTxt = `# robots.txt for ${siteConfig.title}

# Allow all crawlers
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Major Search Engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Social Media Crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# AI Crawlers
User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

# Educational & Archive Crawlers
User-agent: ia_archiver
Allow: /

User-agent: archive.org_bot
Allow: /

# Academic Research Crawlers
User-agent: Semantic Scholar
Allow: /

User-agent: ResearchGate
Allow: /

User-agent: Academia.edu
Allow: /

# Sitemap locations
Sitemap: ${siteConfig.primaryDomain}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
