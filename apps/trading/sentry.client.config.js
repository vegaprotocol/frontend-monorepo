import * as Sentry from '@sentry/nextjs';

const dsn = process.env['NX_TRADING_SENTRY_DSN'];

if (dsn) {
  Sentry.init({
    dsn,
    // integrations: [new BrowserTracing()],
    tracesSampleRate: 1,
    environment: process.env['NX_VEGA_ENV'],
  });
}
