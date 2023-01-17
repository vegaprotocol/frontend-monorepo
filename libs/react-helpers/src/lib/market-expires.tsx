import { getDateTimeFormat } from './format';
import { isValid, parseISO } from 'date-fns';

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
