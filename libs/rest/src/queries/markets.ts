import { removePaginationWrapper } from '@vegaprotocol/utils';
import { restApiUrl } from '../paths';
import {
  type v2ListMarketsResponse,
  vegaMarketState,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import axios from 'axios';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { z } from 'zod';
import { erc20AssetSchema, getAssets } from './assets';
import type { QueryClient } from '@tanstack/react-query';
import { Time } from '../utils';

const marketSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  decimalPlaces: z.number(),
  positionDecimalPlaces: z.number(),
  baseAsset: z.nullable(erc20AssetSchema),
  quoteAsset: erc20AssetSchema,
  liquidityFee: z.number(),
  data: z.object({
    state: z.nativeEnum(vegaMarketState),
  }),
});

const marketsSchema = z.map(z.string(), marketSchema);

export type Market = z.infer<typeof marketSchema>;
export type Markets = z.infer<typeof marketsSchema>;

/**
 * Retrieves all markets from `/markets` endpoint.
 */
export const retrieveMarkets = async (queryClient: QueryClient) => {
  const endpoint = restApiUrl('/api/v2/markets');
  const assets = await getAssets(queryClient);

  if (!assets) {
    throw new Error('assets not cached');
  }

  const res = await axios.get<v2ListMarketsResponse>(endpoint);

  const edges = res.data.markets?.edges;
  const rawMarkets = removePaginationWrapper(edges);

  const markets = rawMarkets.map((m) => {
    let baseAsset = null;
    let quoteAsset = null;

    if (m.tradableInstrument?.instrument?.future) {
      quoteAsset = assets.get(
        get(m, 'tradableInstrument.instrument.future.settlementAsset', '')
      );
    } else if (m.tradableInstrument?.instrument?.perpetual) {
      quoteAsset = assets.get(
        get(m, 'tradableInstrument.instrument.perpetual.settlementAsset', '')
      );
    } else if (m.tradableInstrument?.instrument?.spot) {
      baseAsset = assets.get(
        get(m, 'tradableInstrument.instrument.spot.baseAsset', '')
      );
      quoteAsset = assets.get(
        get(m, 'tradableInstrument.instrument.spot.quoteAsset', '')
      );
    }

    return {
      id: m.id,
      code: m.tradableInstrument?.instrument?.code,
      name: m.tradableInstrument?.instrument?.name,
      decimalPlaces: Number(m.decimalPlaces),
      positionDecimalPlaces: Number(m.positionDecimalPlaces),
      baseAsset,
      quoteAsset,
      liquidityFee: Number(m.fees?.factors?.liquidityFee),
      data: {
        state: m.state,
      },
    };
  });

  const map = new Map(Object.entries(keyBy(markets, 'id')));
  return marketsSchema.parse(map);
};

export const OPEN_MARKETS_STATES = [
  vegaMarketState.STATE_ACTIVE,
  vegaMarketState.STATE_SUSPENDED,
  vegaMarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
  vegaMarketState.STATE_PENDING,
];

export const CLOSED_MARKETS_STATES = [
  vegaMarketState.STATE_SETTLED,
  vegaMarketState.STATE_TRADING_TERMINATED,
  vegaMarketState.STATE_CLOSED,
  vegaMarketState.STATE_CANCELLED,
];

export const PROPOSED_MARKETS_STATES = [vegaMarketState.STATE_PROPOSED];

export const isActiveMarket = (market: Market) => {
  return OPEN_MARKETS_STATES.includes(market.data.state);
};

export const queryKeys = {
  all: ['markets'],
  list: () => [...queryKeys.all, 'list'],
  single: (marketId?: string) => [...queryKeys.all, 'single', { marketId }],
} as const;

export async function getMarkets(queryClient: QueryClient) {
  const markets = queryClient.fetchQuery({
    queryKey: queryKeys.all,
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Time.HOUR,
  });

  if (!markets) {
    throw new Error('no markets');
  }

  return markets;
}

export async function getMarket(queryClient: QueryClient, marketId: string) {
  const markets = await getMarkets(queryClient);
  const market = markets.get(marketId);

  if (!market) {
    throw new Error('market not fuond');
  }

  return market;
}
