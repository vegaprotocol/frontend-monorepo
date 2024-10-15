import { restApiUrl } from '../paths';
import {
  type v2ListLatestMarketDataResponse,
  type v2GetLatestMarketDataResponse,
  type vegaMarketData,
  vegaCompositePriceType,
  vegaMarketState,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import compact from 'lodash/compact';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';
import { Decimal, Time } from '../utils';
import { type Market, getMarket, getMarkets } from './markets';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

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
  openInterest: z.instanceof(Decimal),
});
export type MarketData = z.infer<typeof marketDataSchema>;

const marketsDataSchema = z.map(z.string(), marketDataSchema);
export type MarketsData = z.infer<typeof marketsDataSchema>;

export function marketsDataOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarketsData(queryClient),
    staleTime: Time.MIN,
  });
}

export async function retrieveMarketsData(queryClient: QueryClient) {
  const endpoint = restApiUrl('/api/v2/markets/data');

  const [markets, res] = await Promise.all([
    getMarkets(queryClient),
    axios.get<v2ListLatestMarketDataResponse>(endpoint),
  ]);

  const data = compact(
    res.data.marketsData?.map((d) => {
      if (!d.market) return null;

      const market = markets.get(d.market);

      if (!market) return null;

      return mapMarketData(d, market);
    })
  );

  const map = new Map(Object.entries(keyBy(data, 'marketId')));
  const marketsData = marketsDataSchema.parse(map);

  return marketsData;
}

const pathParamsSchema = z.object({
  marketId: z.string().optional(),
});
export type MarketsDataPathParams = z.infer<typeof pathParamsSchema>;

export function marketDataOptions(queryClient: QueryClient, marketId?: string) {
  return queryOptions({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarketData(queryClient, { marketId }),
    staleTime: Time.MIN,
    refetchInterval: Time.MIN,
  });
}

export async function retrieveMarketData(
  queryClient: QueryClient,
  pathParams: MarketsDataPathParams
) {
  if (!pathParams.marketId) {
    return;
  }

  const endpoint = restApiUrl('/api/v2/market/data/{marketId}/latest', {
    marketId: pathParams.marketId,
  });

  const [market, res] = await Promise.all([
    getMarket(queryClient, pathParams.marketId),
    axios.get<v2GetLatestMarketDataResponse>(endpoint),
  ]);

  const data = res.data.marketData;

  if (!data) return;

  return marketDataSchema.parse(mapMarketData(data, market));
}

function mapMarketData(data: vegaMarketData, market: Market) {
  const priceSources = compact(
    data.markPriceState?.priceSources?.map((ps) => ({
      priceSource: ps.priceSource,
      price: new Decimal(ps.price, market.decimalPlaces),
      lastUpdated: Number(ps.lastUpdated),
    }))
  );
  const marketData = {
    marketId: data.market,
    markPrice: new Decimal(data.markPrice, market.decimalPlaces),
    markPriceType: data.markPriceType,
    markPriceSources: priceSources,
    state: data.marketState,
    openInterest: new Decimal(data.openInterest, market.positionDecimalPlaces),
  };

  return marketData;
}

export const queryKeys = {
  all: ['markets-data'],
  list: () => [...queryKeys.all, 'list'],
  single: (marketId?: string) => [...queryKeys.all, 'single', { marketId }],
} as const;
