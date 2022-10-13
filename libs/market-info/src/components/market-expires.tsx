import { format, isValid, parseISO } from 'date-fns';

export const EXPIRE_DATE_FORMAT = 'MMM dd';

export const getMarketExpiryDate = (tags?: ReadonlyArray<string> | null) => {
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
    return dateFound ? format(dateFound, EXPIRE_DATE_FORMAT) : null;
  }
  return null;
};

export const SimpleMarketExpires = ({
  tags,
}: {
  tags?: ReadonlyArray<string> | null;
}) => {
  const date = getMarketExpiryDate(tags);
  return date ? (
    <div className="p-2 text-ui-small border border-pink text-pink inline-block">{`${date}`}</div>
  ) : null;
};
