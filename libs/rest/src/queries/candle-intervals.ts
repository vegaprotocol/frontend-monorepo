import { queryOptions } from '@tanstack/react-query';
import { restApiUrl } from '../paths';
import { type v2ListCandleIntervalsResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import { z } from 'zod';

export enum Interval {
  BLOCK = 'block',
  DAYS_1 = '1 day',
  DAYS_7 = '7 days',
  HOURS_1 = '1 hour',
  HOURS_12 = '12 hours',
  HOURS_4 = '4 hours',
  HOURS_6 = '6 hours',
  HOURS_8 = '8 hours',
  MINUTES_1 = '1 minute',
  MINUTES_15 = '15 minutes',
  MINUTES_30 = '30 minutes',
  MINUTES_5 = '5 minutes',
}

const parametersSchema = z.object({
  marketId: z.string(),
});

export type QueryParams = z.infer<typeof parametersSchema>;

const candleIntervalSchema = z.object({
  interval: z.string(),
  candleId: z.string(),
});

const candleIntervalsSchema = z.array(candleIntervalSchema);

export type CandleIntervals = z.infer<typeof candleIntervalsSchema>;

export function candleIntervalQueryOptions(params: { marketId: string }) {
  return queryOptions({
    queryKey: queryKeys.single(params.marketId),
    queryFn: () => retrieveCandleIntervals({ marketId: params.marketId }),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export async function retrieveCandleIntervals(params: QueryParams) {
  const endpoint = restApiUrl('/api/v2/candle/intervals');

  const searchParams = parametersSchema.parse(params);

  const res = await axios.get<v2ListCandleIntervalsResponse>(endpoint, {
    params: new URLSearchParams(searchParams),
  });

  const data = compact(
    res.data.intervalToCandleId?.filter(
      ({ interval, candleId }) => interval && candleId
    )
  );

  return candleIntervalsSchema.parse(data);
}

export function getCandleId(
  candleIntervals: CandleIntervals | undefined,
  interval: Interval
) {
  return candleIntervals?.find((ci) => ci.interval === interval);
}

export const queryKeys = {
  all: ['candle-intervals'],
  single: (marketId?: string) => [...queryKeys.all, 'single', { marketId }],
} as const;
