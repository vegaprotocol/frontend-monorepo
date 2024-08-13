import { restApiUrl } from '../paths';
import {
  type v2ListLatestMarketDataResponse,
  vegaCompositePriceType,
  vegaMarketState,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';
import { Decimal } from '../utils';
import { type Markets, queryKeys as marketQueryKeys } from './markets';
import type { QueryClient } from '@tanstack/react-query';

const parametersSchema = z.optional(
  z.object({
    market: z.optional(z.string()),
  })
);

export type MarketsDataQueryParams = z.infer<typeof parametersSchema>;

export const marketDataSchema = z.object({
  marketId: z.string(),
  markPrice: z.instanceof(Decimal),
  markPriceType: z.optional(z.nativeEnum(vegaCompositePriceType)),
  markPriceSources: z.array(
    z.object({
      priceSource: z.string(),
      price: z.instanceof(Decimal),
      lastUpdated: z.number(),
    })
  ),
  state: z.nativeEnum(vegaMarketState),
});
export type MarketData = z.infer<typeof marketDataSchema>;

const marketsDataSchema = z.map(z.string(), marketDataSchema);
export type MarketsData = z.infer<typeof marketsDataSchema>;

export async function retrieveMarketsData(
  queryClient: QueryClient,
  params?: MarketsDataQueryParams
) {
  const endpoint = restApiUrl('/api/v2/markets/data');
  const searchParams = parametersSchema.parse(params);

  const markets = queryClient.getQueryData<Markets>(marketQueryKeys.list());
  if (!markets) {
    throw new Error('markets not cached');
  }

  const res = await axios.get<v2ListLatestMarketDataResponse>(endpoint, {
    params: new URLSearchParams(searchParams),
  });

  const data = compact(
    res.data.marketsData?.map((d) => {
      if (!d.market) return undefined;

      const market = markets?.get(d.market);
      if (!market) return undefined;

      const asset = market.quoteAsset;

      const markPrice = new Decimal(d.markPrice, market.decimalPlaces);

      const priceSources = compact(
        d.markPriceState?.priceSources?.map((ps) => ({
          priceSource: ps.priceSource,
          price: new Decimal(ps.price, asset.decimals),
          lastUpdated: Number(ps.lastUpdated),
        }))
      );

      const marketData = {
        marketId: d.market,
        markPrice,
        markPriceType: d.markPriceType,
        markPriceSources: priceSources,
        state: d.marketState,
      };

      return marketData;
    })
  );

  const map = new Map(Object.entries(keyBy(data, 'marketId')));
  const marketsData = marketsDataSchema.parse(map);

  // TODO: Consider just updating the state (if different) in the main `useMarkets` hook.

  return marketsData;
}

export const queryKeys = {
  all: ['markets-data'],
  list: () => [...queryKeys.all, 'list'],
  single: (marketId?: string) => [...queryKeys.all, 'single', { marketId }],
} as const;
