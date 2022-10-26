import { getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import { format, isValid, parseISO } from 'date-fns';

import type { SingleMarketFieldsFragment } from '@vegaprotocol/market-list';
export const EXPIRE_DATE_FORMAT = 'MMM dd';

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
    return dateFound ? format(dateFound, EXPIRE_DATE_FORMAT) : null;
  }
  return null;
};

export const getExpiryDate = (market: SingleMarketFieldsFragment): string => {
  const closeDate = getMarketExpiryDate(
    market.tradableInstrument.instrument.metadata.tags
  );
  const closedMarketDate =
    market.marketTimestamps.close && new Date(market.marketTimestamps.close);
  let content = null;
  if (!closeDate) {
    content = closedMarketDate
      ? `Expired on ${getDateTimeFormat().format(closedMarketDate)}`
      : t('Not time-based');
  } else {
    const isExpired = Date.now() - closeDate.valueOf() > 0;
    const expiryDate = getDateTimeFormat().format(closeDate);
    if (isExpired) {
      content = closedMarketDate
        ? `Expired on ${getDateTimeFormat().format(closedMarketDate)}`
        : t('Expired');
    } else {
      content = expiryDate;
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
