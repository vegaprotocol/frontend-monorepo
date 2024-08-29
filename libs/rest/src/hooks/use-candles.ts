import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  queryKeys as candleDataQueryKeys,
  retrieveCandleData,
} from '../queries/candle-data';
import {
  type Interval,
  queryKeys as candleIntervalsQueryKeys,
  getCandleId,
  retrieveCandleIntervals,
} from '../queries/candle-intervals';
import { Time } from '../utils/datetime';

export function candleIntervalQueryOptions(params: { marketId: string }) {
  return queryOptions({
    queryKey: candleIntervalsQueryKeys.single(params.marketId),
    queryFn: () => retrieveCandleIntervals({ marketId: params.marketId }),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function candleDataQueryOptions(
  client: QueryClient,
  params: {
    candleId: string;
    marketId: string;
    fromTimestamp?: string;
    toTimestamp?: string;
  }
) {
  return queryOptions({
    queryKey: candleDataQueryKeys.single(
      params.marketId,
      params.candleId,
      params.fromTimestamp,
      params.toTimestamp
    ),
    queryFn: () => retrieveCandleData(params, client),
    staleTime: Time.HOUR,
    enabled: Boolean(params.candleId),
  });
}

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
