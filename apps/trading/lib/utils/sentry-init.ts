import { ENV } from '../config';
import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

export const SentryInit = () => {
  const { dsn } = ENV;
  if (dsn && Boolean(SENTRY_AUTH_TOKEN)) {
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: ENV.envName,
    });
  }
};

export const SentryClose = () => Sentry.close();
