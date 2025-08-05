import { logError } from './error-handling';

export async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean;
  submitted: number;
  successful: number;
  endpoints: number;
}> {
  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urlList: urls }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logError('IndexNow submission failed', error, {
      component: 'indexnow',
      action: 'submit_urls',
      data: { urls },
    });
    throw error;
  }
}

export async function submitUrlToIndexNow(url: string) {
  return submitToIndexNow([url]);
}
