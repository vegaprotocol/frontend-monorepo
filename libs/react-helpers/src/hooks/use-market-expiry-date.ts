import { MarketState } from '@vegaprotocol/types';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { isValid, parseISO } from 'date-fns';
import { useT } from './use-t';

export const useMarketExpiryDate = (
  tags: ReadonlyArray<string> | null | undefined,
  close: string | null,
  state: MarketState
): string => {
  const t = useT();
  const metadataExpiryDate = getMarketExpiryDate(tags);
  const marketTimestampCloseDate = close && new Date(close);
  let content = null;
  if (!metadataExpiryDate) {
    content = marketTimestampCloseDate
      ? t('Expired on {{date}}', {
          date: getDateTimeFormat().format(marketTimestampCloseDate),
        })
      : t('Not time-based');
  } else {
    const isExpired =
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (state === MarketState.STATE_TRADING_TERMINATED ||
        state === MarketState.STATE_SETTLED);
    if (isExpired) {
      content = marketTimestampCloseDate
        ? t('Expired on {{date}}', {
            date: getDateTimeFormat().format(marketTimestampCloseDate),
          })
        : t('Expired');
    } else {
      content = getDateTimeFormat().format(metadataExpiryDate);
    }
  }
  return content;
};

export const getMarketExpiryDateFormatted = (
  tags?: ReadonlyArray<string> | null
): string | null => {
  if (tags) {
    const dateFound = getMarketExpiryDate(tags);
    return dateFound ? getDateTimeFormat().format(dateFound) : null;
  }
  return null;
};

export const getMarketExpiryDate = (
  tags?: ReadonlyArray<string> | null
): Date | null => {
  if (tags) {
    const dateFound = tags.reduce<Date | null>((agg, tag) => {
      const parsed = parseISO(
        (tag.match(/^settlement.*:/) &&
          tag
            .split(':')
            .filter((item, i) => i)
            .join(':')) as string
      );
      if (isValid(parsed)) {
        agg = parsed;
      }
      return agg;
    }, null);
    return dateFound;
  }
  return null;
};
