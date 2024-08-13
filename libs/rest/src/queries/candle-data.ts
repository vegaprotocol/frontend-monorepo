import { removePaginationWrapper } from '@vegaprotocol/utils';

import { restApiUrl } from '../paths';
import { type v2ListCandleDataResponse } from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import omit from 'lodash/omit';
import { z } from 'zod';
import { Decimal } from '../utils';
import { fromNanoSeconds } from '../utils/datetime';
import type { Interval } from './candle-intervals';
import { getMarketFromCache } from './markets';

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
  high: z.optional(z.instanceof(Decimal)),
  low: z.optional(z.instanceof(Decimal)),
  open: z.optional(z.instanceof(Decimal)),
  close: z.optional(z.instanceof(Decimal)),
  volume: z.instanceof(Decimal),
  notional: z.instanceof(Decimal),
});

export type Candle = z.infer<typeof candleSchema>;

const candlesSchema = z.array(candleSchema);

export async function retrieveCandleData(params: QueryParams) {
  const endpoint = restApiUrl('/api/v2/candle');
  let searchParams = parametersSchema.parse(params);

  // have to omit optional parameters, otherwise the API results with Bad Request
  if (!searchParams.fromTimestamp) {
    searchParams = omit(searchParams, 'fromTimestamp');
  }
  if (!searchParams.toTimestamp) {
    searchParams = omit(searchParams, 'toTimestamp');
  }

  const market = getMarketFromCache(searchParams.marketId);
  if (!market) {
    throw new Error('market not found');
  }

  const res = await axios.get<v2ListCandleDataResponse>(endpoint, {
    params: new URLSearchParams(omit(searchParams, 'marketId')),
  });

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
        start: fromNanoSeconds(start) as Date,
        lastUpdate: fromNanoSeconds(lastUpdate) as Date,
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
  single: (
    marketId: string,
    interval: Interval,
    fromTimestamp?: string,
    toTimestamp?: string
  ) => [
    ...queryKeys.all,
    'single',
    { marketId, interval, fromTimestamp, toTimestamp },
  ],
} as const;
