import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';
import { ENV } from './lib/config/env';

const { dsn } = ENV;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1,
    environment: ENV.envName,
  });
}
