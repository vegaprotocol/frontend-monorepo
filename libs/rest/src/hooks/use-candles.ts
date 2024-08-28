import { useQuery, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import {
  type Candle,
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
    staleTime: Number.POSITIVE_INFINITY,
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

/** Get candle data from the last 24 hours */
export function useCandleData(marketId: string) {
  const queryResult = useCandles(
    marketId,
    Interval.HOURS_1,
    toNanoSeconds(yesterday())
  );

  const candles = queryResult.data?.filter((c) =>
    Boolean(c.close && c.close.rawValue !== '')
  );

  const notional = useCandleNotional(candles);
  const volume = useCandleVolume(candles);
  const sparkline = useCandleSparkline(candles);
  const priceChange = useCandlePriceChange(candles);
  const pctChange = useCandlePctChange(candles);

  return {
    ...queryResult,
    notional,
    volume,
    sparkline,
    priceChange,
    pctChange,
  };
}

function useCandleNotional(candles?: Candle[]) {
  if (!candles) return;

  const notional = candles?.reduce((acc, candle) => {
    if (candle.notional) {
      return acc.plus(candle.notional.value);
    }
    return acc;
  }, new BigNumber(0));

  return notional;
}

function useCandleVolume(candles?: Candle[]) {
  if (!candles) return;

  const volume = candles?.reduce((acc, candle) => {
    if (candle.volume) {
      return acc.plus(candle.volume.value);
    }
    return acc;
  }, new BigNumber(0));

  return volume;
}

function useCandleSparkline(candles?: Candle[]) {
  if (!candles) return;

  const sparkline = candles?.map((d) => Number(d.close?.rawValue));

  return sparkline;
}

function useCandlePriceChange(candles?: Candle[]) {
  if (!candles) return;

  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];

  if (!firstCandle?.close || !lastCandle?.close) return;

  const priceChange = lastCandle.close.value.minus(firstCandle.close.value);
  return priceChange;
}

function useCandlePctChange(candles?: Candle[]) {
  if (!candles) return;

  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];

  if (!firstCandle?.close || !lastCandle?.close) return;

  const priceChange = lastCandle.close.value.minus(firstCandle.close.value);
  const pctChange = priceChange
    .dividedBy(firstCandle.close.value)
    .multipliedBy(100);
  return pctChange;
}
