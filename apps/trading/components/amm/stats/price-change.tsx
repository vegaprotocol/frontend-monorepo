import {
  Interval,
  type Market,
  toNanoSeconds,
  useCandles,
  yesterday,
} from '@vegaprotocol/rest';
import { cn } from '@vegaprotocol/ui-toolkit';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import first from 'lodash/first';
import last from 'lodash/last';
import orderBy from 'lodash/orderBy';
import { ArrowDown, ArrowUp, Dot, LoaderCircleIcon } from 'lucide-react';

export const PriceChange = ({ market }: { market: Market }) => {
  const { data, status } = useCandles(
    market.id,
    Interval.HOURS_1,
    toNanoSeconds(yesterday())
  );

  if (status === 'pending') {
    return (
      <div className="h-4 py-1">
        <LoaderCircleIcon size={14} className="animate-spin" />
      </div>
    );
  }

  const validCandles = data?.filter((c) => !c.close?.value.isNaN());

  const sorted = orderBy(validCandles, (c) => c.lastUpdate, 'asc');

  const firstCandle = first(sorted)?.close?.value || BigNumber(0);
  const lastCandle = last(sorted)?.close?.value || BigNumber(0);

  const priceChange = lastCandle.minus(firstCandle);

  const d = firstCandle.isZero() ? BigNumber(1) : firstCandle;
  const p = priceChange.dividedBy(d).times(100);

  return <Change value={p} />;
};

const Change = ({ value }: { value: BigNumber }) => {
  return (
    <span
      className={cn('flex gap-1 items-center', {
        'text-dir-down': value.isLessThan(0),
        'text-dir-up': value.isGreaterThan(0),
      })}
    >
      <Arrow value={value} />
      <span>{formatNumberPercentage(value, 2)}</span>
    </span>
  );
};

const Arrow = ({ value }: { value: BigNumber }) => {
  if (value.isLessThan(0)) {
    return <ArrowDown size={14} />;
  }
  if (value.isGreaterThan(0)) {
    return <ArrowUp size={14} />;
  }
  return <Dot size={14} />;
};
