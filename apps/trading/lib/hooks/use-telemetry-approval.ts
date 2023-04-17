import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';
import { ENV } from '../config';

export const STORAGE_KEY = 'vega_telemetry_approval';

export const SentryInit = () => {
  const { dsn } = ENV;
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1,
      environment: ENV.envName,
    });
  }
};

export const useTelemetryApproval = (): [
  value: boolean,
  setValue: (value: boolean) => void
] => {
  const [value, setValue, removeValue] = useLocalStorage(STORAGE_KEY);
  const setApprove = useCallback(
    (value: boolean) => {
      if (value) {
        SentryInit();
        return setValue('1');
      }
      removeValue();
    },
    [setValue, removeValue]
  );
  return [Boolean(value), setApprove];
};
