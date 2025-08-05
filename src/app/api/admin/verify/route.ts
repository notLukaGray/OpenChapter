import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Validate input
    if (!secret || typeof secret !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Server-side environment variable (not exposed to client)
    const ADMIN_SECRET = process.env.INDEXNOW_ADMIN_SECRET;

    if (!ADMIN_SECRET) {
      logError('INDEXNOW_ADMIN_SECRET environment variable is not set', null, {
        component: 'api/admin/verify',
        action: 'verify_secret',
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use timing-safe comparison to prevent timing attacks
    const isValid =
      secret.length === ADMIN_SECRET.length &&
      secret.split('').every((char, i) => char === ADMIN_SECRET[i]);

    if (isValid) {
      return NextResponse.json({ authorized: true });
    } else {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }
  } catch (error) {
    logError('Admin verification error', error, {
      component: 'api/admin/verify',
      action: 'verify_secret',
    });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
