import { type StopOrder, StopOrderTriggerDirection } from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from './number';
import { useCallback } from 'react';
import { useT } from '../use-t';

export const useFormatTrigger = () => {
  const t = useT();
  return useCallback(
    (
      data: Pick<StopOrder, 'trigger' | 'triggerDirection'> | undefined,
      marketDecimalPlaces: number,
      defaultValue = '-'
    ) => {
      if (data && data?.trigger?.__typename === 'StopOrderPrice') {
        return `${t('Mark')} ${
          data?.triggerDirection ===
          StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
            ? '<'
            : '>'
        } ${addDecimalsFormatNumber(data.trigger.price, marketDecimalPlaces)}`;
      }
      if (
        data &&
        data?.trigger?.__typename === 'StopOrderTrailingPercentOffset'
      ) {
        return `${t('Mark')} ${
          data?.triggerDirection ===
          StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
            ? '+'
            : '-'
        }${(Number(data?.trigger.trailingPercentOffset) * 100).toFixed(1)}%`;
      }
      return defaultValue;
    },
    [t]
  );
};
