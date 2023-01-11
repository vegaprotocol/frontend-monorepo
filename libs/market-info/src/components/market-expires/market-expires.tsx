import { getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import { isValid, parseISO } from 'date-fns';

import type { Market } from '@vegaprotocol/market-list';
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

export const getExpiryDate = (market: Market): string => {
  const metadataExpiryDate = getMarketExpiryDate(
    market.tradableInstrument.instrument.metadata.tags
  );
  const marketTimestampCloseDate =
    market.marketTimestamps.close && new Date(market.marketTimestamps.close);
  let content = null;
  if (!metadataExpiryDate) {
    content = marketTimestampCloseDate
      ? `Expired on ${getDateTimeFormat().format(marketTimestampCloseDate)}`
      : t('Not time-based');
  } else {
    const isExpired =
      Date.now() - metadataExpiryDate.valueOf() > 0 &&
      (market.state === MarketState.STATE_TRADING_TERMINATED ||
        market.state === MarketState.STATE_SETTLED);
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
