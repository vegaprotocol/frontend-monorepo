import { useQuery, useQueryClient } from '@tanstack/react-query';
import { candleDataQueryOptions } from '../queries/candle-data';
import {
  type Interval,
  candleIntervalQueryOptions,
  getCandleId,
} from '../queries/candle-intervals';

export function useCandleIntervals(params: { marketId: string }) {
  const queryResult = useQuery(candleIntervalQueryOptions(params));
  return queryResult;
}

export function useCandles(
  marketId: string,
  interval: Interval,
  fromTimestamp?: number,
  toTimestamp?: number
) {
  const client = useQueryClient();
  const { data: intervals } = useCandleIntervals({ marketId });

  const candleId = getCandleId(intervals, interval)?.candleId;
  const from = fromTimestamp ? String(fromTimestamp) : undefined;
  const to = toTimestamp ? String(toTimestamp) : undefined;

  const queryResult = useQuery(
    candleDataQueryOptions(client, {
      candleId: candleId || '',
      marketId,
      fromTimestamp: from,
      toTimestamp: to,
    })
  );

  return queryResult;
}
