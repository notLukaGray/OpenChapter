'use client';

import React, { useState, useEffect } from 'react';
import { submitToIndexNow } from '@/lib/indexnow.client';
import { useSearchParams } from 'next/navigation';

export default function IndexNowAdminClient() {
  // const [customUrl, setCustomUrl] = useState(''); // Commented out - no longer needed
  const [result, setResult] = useState<string | Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const searchParams = useSearchParams();

  // Server-side authentication check
  useEffect(() => {
    const verifyAuth = async () => {
      const secret = searchParams.get('secret');
      if (!secret) {
        setAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret }),
        });

        const data = await response.json();
        setAuthorized(data.authorized);
      } catch {
        setAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [searchParams]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying...</h1>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600">
            You must provide the correct <code>secret</code> query parameter to
            access this page.
          </p>
        </div>
      </div>
    );
  }

  async function handleAllChapters() {
    setLoading(true);
    setResult(null);
    try {
      // Fetch chapter URLs from the API route
      const res = await fetch('/api/chapters/urls');
      const data = await res.json();
      if (!data.urls || !Array.isArray(data.urls)) {
        setResult({ error: 'Failed to fetch chapter URLs' });
        setLoading(false);
        return;
      }
      const indexnowRes = await submitToIndexNow(data.urls);
      setResult(indexnowRes);
    } catch (err) {
      setResult({ error: err?.toString() });
    } finally {
      setLoading(false);
    }
  }

  // Custom URL handler - commented out since we auto-submit all chapters
  // async function handleCustomUrl(e: React.FormEvent) {
  //   e.preventDefault();
  //   setLoading(true);
  //   setResult(null);
  //   try {
  //     const res = await submitToIndexNow([customUrl]);
  //     setResult(res);
  //   } catch (err) {
  //     setResult({ error: err?.toString() });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">IndexNow Admin</h1>
        <button
          className="w-full bg-[#b95b23] text-white py-2 rounded mb-6 hover:bg-[#a04a1a] transition-colors"
          onClick={handleAllChapters}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit All Chapters to IndexNow'}
        </button>
        {}
        {result && (
          <div className="mt-4 text-sm bg-gray-50 border border-gray-200 rounded p-3 text-left whitespace-pre-wrap">
            {typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
