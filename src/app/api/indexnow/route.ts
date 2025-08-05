import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/error-handling';
import { siteConfig } from '@/lib/config';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urlList } = body;

    if (!urlList || !Array.isArray(urlList)) {
      return NextResponse.json(
        { error: 'urlList is required and must be an array' },
        { status: 400 }
      );
    }

    // Validate URLs are from your domain
    const validUrls = urlList.filter((url: string) => {
      try {
        const urlObj = new URL(url);
        return siteConfig.domains.some(
          domain => urlObj.hostname === new URL(domain).hostname
        );
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs found' },
        { status: 400 }
      );
    }

    // Prepare IndexNow payload
    const payload = {
      host: new URL(siteConfig.primaryDomain).hostname,
      key: siteConfig.indexnow.key,
      keyLocation: siteConfig.indexnow.keyLocation,
      urlList: validUrls,
    };

    // Submit to all IndexNow endpoints
    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      )
    );

    const successful = results.filter(
      result => result.status === 'fulfilled' && result.value.ok
    ).length;

    return NextResponse.json({
      success: true,
      submitted: validUrls.length,
      successful,
      endpoints: INDEXNOW_ENDPOINTS.length,
    });
  } catch (error) {
    logError('IndexNow error', error, {
      component: 'api/indexnow',
      action: 'submit_urls',
      data: { error: 'Request processing failed' },
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'IndexNow API endpoint',
    key: siteConfig.indexnow.key,
    keyLocation: siteConfig.indexnow.keyLocation,
    endpoints: INDEXNOW_ENDPOINTS,
  });
}
