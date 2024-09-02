import { removePaginationWrapper } from '@vegaprotocol/utils';

import { restApiUrl } from '../paths';
import { type v2ListCandleDataResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import omit from 'lodash/omit';
import { z } from 'zod';
import { Decimal } from '../utils';
import { fromNanoSeconds, Time } from '../utils/datetime';
import { getMarket } from './markets';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

const parametersSchema = z.object({
  candleId: z.string(),
  marketId: z.string(),
  fromTimestamp: z.optional(z.string()),
  toTimestamp: z.optional(z.string()),
});

export type QueryParams = z.infer<typeof parametersSchema>;

const candleSchema = z.object({
  start: z.date(),
  lastUpdate: z.date(),
  high: z.instanceof(Decimal),
  low: z.instanceof(Decimal),
  open: z.instanceof(Decimal),
  close: z.instanceof(Decimal),
  volume: z.instanceof(Decimal),
  notional: z.instanceof(Decimal),
});

export type Candle = z.infer<typeof candleSchema>;

const candlesSchema = z.array(candleSchema);

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
    queryKey: queryKeys.single(params),
    queryFn: () => retrieveCandleData(params, client),
    staleTime: Time.HOUR,
    enabled: Boolean(params.candleId),
  });
}

export async function retrieveCandleData(
  params: QueryParams,
  queryClient: QueryClient
) {
  const endpoint = restApiUrl('/api/v2/candle');
  let searchParams = parametersSchema.parse(params);

  // have to omit optional parameters, otherwise the API results with Bad Request
  if (!searchParams.fromTimestamp) {
    searchParams = omit(searchParams, 'fromTimestamp');
  }
  if (!searchParams.toTimestamp) {
    searchParams = omit(searchParams, 'toTimestamp');
  }

  const [market, res] = await Promise.all([
    getMarket(queryClient, searchParams.marketId),
    axios.get<v2ListCandleDataResponse>(endpoint, {
      params: new URLSearchParams(omit(searchParams, 'marketId')),
    }),
  ]);

  const data = compact(
    removePaginationWrapper(res.data.candles?.edges).map((cd) => {
      const { start, lastUpdate, high, low, open, close, volume, notional } =
        cd;

      // skip any without timestamps
      if (!start || !lastUpdate) return undefined;

      const highPrice = new Decimal(high, market.decimalPlaces);
      const lowPrice = new Decimal(low, market.decimalPlaces);
      const openPrice = new Decimal(open, market.decimalPlaces);
      const closePrice = new Decimal(close, market.decimalPlaces);
      const volumeValue = new Decimal(volume, market.positionDecimalPlaces);
      const notionalValue = new Decimal(
        notional,
        market.positionDecimalPlaces + market.decimalPlaces
      );

      const candle: Candle = {
        start: fromNanoSeconds(start),
        lastUpdate: fromNanoSeconds(lastUpdate),
        high: highPrice,
        low: lowPrice,
        open: openPrice,
        close: closePrice,
        volume: volumeValue,
        notional: notionalValue,
      };

      return candle;
    })
  );

  return candlesSchema.parse(data);
}

export const queryKeys = {
  all: ['candle-data'],
  single: (params: {
    marketId: string;
    candleId: string;
    fromTimestamp?: string;
    toTimestamp?: string;
  }) => [...queryKeys.all, 'single', params],
} as const;
