import { t } from './i18n';
import { getDateTimeFormat } from './format';
import { isValid, parseISO } from 'date-fns';

import { MarketState } from '@vegaprotocol/types';

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

export const getMarketExpiryDateFormatted = (
  tags?: ReadonlyArray<string> | null
): string | null => {
  if (tags) {
    const dateFound = getMarketExpiryDate(tags);
    return dateFound ? getDateTimeFormat().format(dateFound) : null;
  }
  return null;
};

export const getExpiryDate = (
  //   market: SingleMarketFieldsFragment,
  tags?: ReadonlyArray<string> | null,
  close?: string | null,
  state?: MarketState
): string => {
  const metadataExpiryDate = getMarketExpiryDate(tags);
  const marketTimestampCloseDate = close && new Date(close);
  let content = null;
  if (!metadataExpiryDate) {
    content = marketTimestampCloseDate
      ? `Expired on ${getDateTimeFormat().format(marketTimestampCloseDate)}`
      : t('Not time-based');
  } else {
    const isExpired =
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (state === MarketState.STATE_TRADING_TERMINATED ||
        state === MarketState.STATE_SETTLED);
    if (isExpired) {
      content = marketTimestampCloseDate
        ? `Expired on ${getDateTimeFormat().format(marketTimestampCloseDate)}`
        : t('Expired');
    } else {
      content = getDateTimeFormat().format(metadataExpiryDate);
    }
  }
  return content;
};

export const MarketExpires = ({
  tags,
}: {
  tags?: ReadonlyArray<string> | null;
}) => {
  const date = getMarketExpiryDateFormatted(tags);
  return date ? (
    <div className="p-2 text-ui-small border border-pink text-pink inline-block">{`${date}`}</div>
  ) : null;
};
