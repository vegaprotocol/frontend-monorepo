import axios from 'axios';
import { z } from 'zod';
import { Time } from '../utils/datetime';
import { queryOptions } from '@tanstack/react-query';

const parametersSchema = z.object({
  marketId: z.string(),
  interval: z.string(),
  fromTimestamp: z.string(),
  toTimestamp: z.string().optional(),
});

export type QueryParams = z.infer<typeof parametersSchema>;

const candleSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  marketId: z.string(),
  interval: z.number(),
  openingTimestamp: z.number(),
  closingTimestamp: z.number(),
  open: z.number(),
  close: z.number(),
  high: z.number(),
  low: z.number(),
  volume: z.number().default(0),
});

export type Candle = z.infer<typeof candleSchema>;

const candlesSchema = z.array(candleSchema);

export function candleDataQueryOptionsV2(params: {
  marketId: string;
  interval: string;
  fromTimestamp: string;
  toTimestamp?: string;
}) {
  return queryOptions({
    queryKey: queryKeys.single(params),
    queryFn: () => retrieveCandleDataV2(params),
    staleTime: Time.HOUR,
    enabled: Boolean(params.marketId && params.interval),
  });
}

export async function retrieveCandleDataV2(params: QueryParams) {
  const pathparams = parametersSchema.parse(params);
  const base = 'https://candles.neb.exchange';
  const url = new URL(base);
  url.pathname = [
    'data',
    pathparams.marketId,
    pathparams.interval,
    pathparams.fromTimestamp,
    pathparams.toTimestamp,
  ].join('/');

  const result = await axios.get(url.href);

  return candlesSchema.parse(result.data);
}

export const queryKeys = {
  all: ['candle-data-v2'],
  single: (params: {
    marketId: string;
    interval: string;
    fromTimestamp?: string;
    toTimestamp?: string;
  }) => [...queryKeys.all, 'single', params],
} as const;
