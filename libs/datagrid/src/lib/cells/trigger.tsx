import * as Schema from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const formatTrigger = (
  data: Pick<Schema.StopOrder, 'trigger' | 'triggerDirection'> | undefined,
  marketDecimalPlaces: number,
  defaultValue = '-'
) => {
  if (data && data?.trigger?.__typename === 'StopOrderPrice') {
    return `${t('Mark')} ${
      data?.triggerDirection ===
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
        ? '<'
        : '>'
    } ${addDecimalsFormatNumber(data.trigger.price, marketDecimalPlaces)}`;
  }
  if (data && data?.trigger?.__typename === 'StopOrderTrailingPercentOffset') {
    return `${t('Mark')} ${
      data?.triggerDirection ===
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW
        ? '+'
        : '-'
    }${(Number(data?.trigger.trailingPercentOffset) * 100).toFixed(1)}%`;
  }
  return defaultValue;
};
