import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { useFiveDaysAgo, useYesterday } from '@vegaprotocol/react-helpers';
import type { MarketCandlesFieldsFragment } from '../__generated__';
import { marketCandlesProvider } from '../market-candles-provider';
import { Interval } from '@vegaprotocol/types';

export const useCandles = ({ marketId }: { marketId?: string }) => {
  const fiveDaysAgo = useFiveDaysAgo();
  const yesterday = useYesterday();
  const since = new Date(fiveDaysAgo).toISOString();
  const { data, error } = useThrottledDataProvider({
    dataProvider: marketCandlesProvider,
    variables: {
      marketId: marketId || '',
      interval: Interval.INTERVAL_I1H,
      since,
    },
    skip: !marketId,
  });

  const fiveDaysCandles = data?.filter(Boolean);

  const oneDayCandles = fiveDaysCandles?.filter((candle) =>
    isCandleLessThan24hOld(candle, yesterday)
  );

  return { oneDayCandles, error, fiveDaysCandles };
};

export const isCandleLessThan24hOld = (
  candle: MarketCandlesFieldsFragment | undefined,
  yesterday: number
) => {
  if (!candle?.periodStart) {
    return false;
  }
  const candleDate = new Date(candle.periodStart);
  return candleDate > new Date(yesterday);
};
