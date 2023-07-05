import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const SentryInit = (dsn: string, env?: string) => {
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: env || '',
    });
  }
};

export const SentryClose = () => Sentry.close();
