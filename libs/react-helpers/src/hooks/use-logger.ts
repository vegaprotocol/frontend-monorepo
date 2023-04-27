import { useRef } from 'react';
import type { LocalLogger, LoggerConf } from '@vegaprotocol/utils';
import { localLoggerFactory, SentryInit } from '@vegaprotocol/utils';

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
