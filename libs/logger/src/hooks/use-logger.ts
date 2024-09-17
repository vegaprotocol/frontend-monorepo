import { useRef } from 'react';
import { type LocalLogger, type LoggerConf } from '../lib/local-logger';
import { localLoggerFactory } from '../lib/local-logger';

export interface LoggerProps extends LoggerConf {
  env?: string;
}

export const useLogger = ({ env, ...props }: LoggerProps) => {
  const logger = useRef<LocalLogger | null>(null);

  if (!logger.current) {
    logger.current = localLoggerFactory(props);
  }

  return logger.current;
};
