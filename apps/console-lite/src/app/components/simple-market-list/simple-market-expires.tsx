import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { EXPIRE_DATE_FORMAT } from '../../constants';

const SimpleMarketExpires = ({
  tags,
}: {
  tags: ReadonlyArray<string> | null;
}) => {
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
    return dateFound ? (
      <div className="p-2 text-ui-small border-1 border-pink text-pink inline-block">{`${format(
        dateFound as Date,
        EXPIRE_DATE_FORMAT
      )}`}</div>
    ) : null;
  }
  return null;
};

export default SimpleMarketExpires;
