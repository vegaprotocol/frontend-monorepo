import { useRef } from 'react';
import { type LocalLogger, type LoggerConf } from '../lib/local-logger';
import { localLoggerFactory } from '../lib/local-logger';
import { SentryInit } from '../lib/sentry-utils';

export interface LoggerProps extends LoggerConf {
  dsn?: string;
  env?: string;
}

export const useLogger = ({ dsn, env, ...props }: LoggerProps) => {
  const logger = useRef<LocalLogger | null>(null);

  if (!logger.current) {
    logger.current = localLoggerFactory(props);
    if (dsn) {
      SentryInit(dsn, env);
    }
  }
  return logger.current;
};
