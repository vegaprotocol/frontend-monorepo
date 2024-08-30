import { useQuery, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import {
  queryKeys as candleDataQueryKeys,
  retrieveCandleData,
} from '../queries/candle-data';
import {
  Interval,
  queryKeys as candleIntervalsQueryKeys,
  getCandleId,
  retrieveCandleIntervals,
} from '../queries/candle-intervals';
import { Time, toNanoSeconds, yesterday } from '../utils/datetime';

export function useCandles(
  marketId: string,
  interval: Interval,
  fromTimestamp?: number,
  toTimestamp?: number
) {
  const client = useQueryClient();
  const { data: intervals } = useQuery({
    queryKey: candleIntervalsQueryKeys.single(marketId),
    queryFn: () => retrieveCandleIntervals({ marketId }),
    staleTime: Time.HOUR,
  });

  const candleId = getCandleId(intervals, interval)?.candleId;
  const from = fromTimestamp ? String(fromTimestamp) : undefined;
  const to = toTimestamp ? String(toTimestamp) : undefined;

  const queryResult = useQuery({
    queryKey: candleDataQueryKeys.single(marketId, interval, from, to),
    queryFn: () =>
      retrieveCandleData(
        {
          candleId: candleId || '',
          marketId,
          fromTimestamp: from,
          toTimestamp: to,
        },
        client
      ),

    enabled: !!candleId,
    staleTime: Time.HOUR,
  });

  return queryResult;
}

export function useVolume24(marketId: string) {
  const { data, ...queryResult } = useCandles(
    marketId,
    Interval.HOURS_1,
    toNanoSeconds(yesterday())
  );

  const notional = data?.reduce((acc, candle) => {
    if (candle.notional) {
      return acc.plus(candle.notional.value);
    }
    return acc;
  }, new BigNumber(0));

  const volume = data?.reduce((acc, candle) => {
    if (candle.volume) {
      return acc.plus(candle.volume.value);
    }
    return acc;
  }, new BigNumber(0));

  return {
    ...queryResult,
    notional,
    volume,
  };
}
