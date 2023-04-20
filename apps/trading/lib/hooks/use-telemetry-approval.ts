import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useCallback } from 'react';
import { SentryInit, SentryClose } from '../utils/sentry-utils';

export const STORAGE_KEY = 'vega_telemetry_approval';

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
      SentryClose();
      removeValue();
    },
    [setValue, removeValue]
  );
  return [Boolean(value), setApprove];
};
