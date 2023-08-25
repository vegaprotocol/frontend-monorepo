import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SentryInit, SentryClose } from '@vegaprotocol/logger';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
export const STORAGE_KEY = 'vega_telemetry_approval';

export const useTelemetryApproval = (): [
  value: string,
  setValue: (value: string) => void,
  defaultValue: string,
  shouldOpen: boolean,
  close: () => void
] => {
  const { VEGA_ENV, SENTRY_DSN } = useEnvironment();
  const defaultTelemetryValue =
    VEGA_ENV === Networks.MAINNET ? 'false' : 'true';
  const [value, setValue] = useLocalStorage(STORAGE_KEY);
  const [shouldOpen, setShouldOpen] = useState(!value);
  const valueRef = useRef(Boolean(value));
  useEffect(() => {
    if (!valueRef.current) {
      setShouldOpen(true);
    }
  }, []);
  const close = useCallback(() => {
    setShouldOpen(false);
  }, []);
  const setApprove = useCallback(
    (value: string) => {
      if (value === 'true' && SENTRY_DSN) {
        SentryInit(SENTRY_DSN, VEGA_ENV);
        return setValue('true');
      }
      SentryClose();
      setValue('false');
    },
    [setValue, SENTRY_DSN, VEGA_ENV]
  );
  return [value || '', setApprove, defaultTelemetryValue, shouldOpen, close];
};
