import { NextRequest, NextResponse } from 'next/server';
import { createSearchIndex, performSearch } from '@/lib/search';
import { logError } from '@/lib/error-handling';

interface CacheEntry {
  data: {
    results: Array<{
      slug: string;
      title: string;
      excerpt: string;
      heading?: string;
      anchorId?: string;
    }>;
  };
  timestamp: number;
}

// Cache search results for better performance
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Create search index once and reuse
let searchIndex: ReturnType<typeof createSearchIndex> | null = null;

function getSearchIndex() {
  if (!searchIndex) {
    searchIndex = createSearchIndex();
  }
  return searchIndex;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.trim().length < 3) {
    return NextResponse.json({
      results: [],
      message: 'Search query must be at least 3 characters long.',
    });
  }

  // Check cache first
  const cacheKey = `${query}-${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const index = getSearchIndex();
    const searchResults = performSearch(query, await index, limit);

    const results = searchResults.map(result => ({
      slug: result.slug,
      title: result.title,
      excerpt: result.excerpt,
      heading: result.heading,
      anchorId: result.anchorId,
    }));

    const response = { results };

    // Cache the result
    searchCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    return NextResponse.json(response);
  } catch (error) {
    logError('Search error', error, {
      component: 'api/search',
      action: 'perform_search',
      data: { query, limit },
    });
    return NextResponse.json({ results: [] });
  }
}
