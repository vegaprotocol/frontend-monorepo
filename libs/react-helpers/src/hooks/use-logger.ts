import { useRef } from 'react';
import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/browser';
import type { LocalLogger } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/utils';

interface Props {
  dsn?: string;
  application?: string;
  tags?: string[];
}

export const useLogger = ({ dsn, ...props }: Props) => {
  const logger = useRef<LocalLogger | null>(null);
  if (!logger.current) {
    logger.current = localLoggerFactory(props);
    if (dsn) {
      Sentry.init({
        dsn,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1,
        defaultIntegrations: false,
      });
    }
  }
  return logger.current;
};
