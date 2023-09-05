import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useCallback } from 'react';
import { SentryInit, SentryClose } from '@vegaprotocol/logger';
import { useEnvironment } from '@vegaprotocol/environment';
export const STORAGE_KEY = 'vega_telemetry_approval';

export const useTelemetryApproval = (): [
  value: boolean,
  setValue: (value: boolean) => void
] => {
  const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  const [value, setValue, removeValue] = useLocalStorage(STORAGE_KEY);
  const setApprove = useCallback(
    (value: boolean) => {
      if (value && SENTRY_DSN) {
        SentryInit(SENTRY_DSN, VEGA_ENV);
        return setValue('1');
      }
      SentryClose();
      removeValue();
    },
    [setValue, removeValue, SENTRY_DSN, VEGA_ENV]
  );
  return [Boolean(value), setApprove];
};
