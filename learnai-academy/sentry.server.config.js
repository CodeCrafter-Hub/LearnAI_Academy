import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production' || !!process.env.SENTRY_DSN,

  // Filter out health check endpoints
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DSN) {
      return null;
    }

    // Filter out health check noise
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Database connection errors (handled gracefully)
    'PrismaClientKnownRequestError',
    'PrismaClientInitializationError',
    // Rate limiting (expected behavior)
    'Rate limit exceeded',
    // Validation errors (user input issues)
    'ZodError',
  ],
});

