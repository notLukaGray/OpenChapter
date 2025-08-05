interface ErrorContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
}

export function logError(
  message: string,
  error?: unknown,
  context?: ErrorContext
): void {
  // In production, you might want to send this to an error tracking service
  // For now, we'll only log in development
  if (process.env.NODE_ENV === 'development') {
    const contextStr = context
      ? ` [${context.component}:${context.action}]`
      : '';
    const errorStr = error ? `: ${error}` : '';
    console.error(`${message}${contextStr}${errorStr}`);
  }

  // In production, you could send to error tracking service here
  // Example: Sentry.captureException(error, { extra: { message, context } });
}

export function logWarning(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    const contextStr = context
      ? ` [${context.component}:${context.action}]`
      : '';
    console.warn(`${message}${contextStr}`);
  }
}

export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context?: ErrorContext
): T {
  try {
    return fn();
  } catch (error) {
    logError('Function execution failed', error, context);
    return fallback;
  }
}

export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError('Async function execution failed', error, context);
    return fallback;
  }
}
