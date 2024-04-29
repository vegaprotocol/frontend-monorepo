import { useYesterday } from '@vegaprotocol/react-helpers';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import {
  MarketsDocument,
  type MarketsQuery,
  type MarketFieldsFragment,
  type MarketFieldsWithAccountsFragment,
} from './__generated__/markets';
import { type MarketsCandlesQueryVariables } from './__generated__/markets-candles';

import {
  marketsDataProvider,
  marketsLiveDataProvider,
  mapMarketDataUpdateToMarketData,
} from './markets-data-provider';
import { marketDataProvider, type MarketData } from './market-data-provider';
import { type MarketDataUpdateFieldsFragment } from './__generated__';
import {
  marketsCandlesProvider,
  type MarketCandles,
} from './markets-candles-provider';
import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import {
  filterClosedMarkets,
  filterAndSortMarkets,
  filterProposedMarkets,
} from './market-utils';
import type { Candle } from './market-candles-provider';

export type Market = MarketFieldsFragment;

const getData = (responseData: MarketsQuery | null): Market[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => edge.node) || null;

export const marketsProvider = makeDataProvider<
  MarketsQuery,
  Market[],
  never,
  never
>({
  query: MarketsDocument,
  getData,
  errorPolicy: 'all',
});

export type MarketMap = Record<string, Market>;
export const marketsMapProvider = makeDerivedDataProvider<
  MarketMap,
  never,
  undefined
>(
  [(callback, client) => marketsProvider(callback, client, undefined)],
  ([markets]) => {
    return ((markets as ReturnType<typeof getData>) || []).reduce(
      (markets, market) => {
        markets[market.id] = market;
        return markets;
      },
      {} as MarketMap
    );
  }
);

export const useMarketsMapProvider = () =>
  useDataProvider({
    dataProvider: marketsMapProvider,
    variables: undefined,
  });

export const marketProvider = makeDerivedDataProvider<
  Market,
  never,
  { marketId: string }
>(
  [(callback, client) => marketsProvider(callback, client, undefined)],
  ([markets], variables) =>
    ((markets as ReturnType<typeof getData>) || []).find(
      (market) => market.id === variables?.marketId
    ) || null
);

export const useMarket = (marketId?: string) => {
  const variables = useMemo(() => ({ marketId: marketId || '' }), [marketId]);
  return useDataProvider({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });
};
export type MarketWithData = Market & { data: MarketData };

export const marketWithDataProvider = makeDerivedDataProvider<
  MarketWithData,
  never,
  { marketId: string }
>([marketProvider, marketDataProvider], ([market, marketData]) => {
  return {
    ...market,
    data: marketData,
  };
});

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([marketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const activeMarketsProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([marketsWithDataProvider], ([markets]) => filterAndSortMarkets(markets));

export const closedMarketsProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([marketsWithDataProvider], ([markets]) => filterClosedMarkets(markets));

export const proposedMarketsProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([marketsWithDataProvider], ([markets]) => filterProposedMarkets(markets));

export type MarketMaybeWithCandles = MarketFieldsWithAccountsFragment & {
  candles?: Candle[];
};

const addCandles = <T extends Market>(
  markets: T[],
  marketsCandles: MarketCandles[]
) =>
  markets.map((market) => ({
    ...market,
    candles: marketsCandles.find((data) => data.marketId === market.id)
      ?.candles,
  }));

export const activeMarketsWithCandlesProvider = makeDerivedDataProvider<
  MarketMaybeWithCandles[],
  never,
  MarketsCandlesQueryVariables
>(
  [
    (callback, client) => activeMarketsProvider(callback, client, undefined),
    marketsCandlesProvider,
  ],
  (parts) => addCandles(parts[0] as Market[], parts[1] as MarketCandles[])
);

export type MarketMaybeWithData = Market & { data?: MarketData };

const addData = <T extends Market>(markets: T[], marketsData: MarketData[]) =>
  markets.map((market) => ({
    ...market,
    data: marketsData.find((data) => data.market.id === market.id),
  }));

export const marketsWithLiveDataProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  MarketMaybeWithData,
  { marketIds: string[] }
>(
  [
    (callback, client, variables) =>
      marketsProvider(callback, client, undefined),
    marketsLiveDataProvider,
  ],
  (partsData, variables, prevData, parts) => {
    if (prevData && parts[1].isUpdate) {
      const data = mapMarketDataUpdateToMarketData(parts[1].delta);
      const index = prevData.findIndex(
        (market) => market.id === data.market.id
      );
      if (index !== -1) {
        const updatedData = [...prevData];
        updatedData[index] = { ...updatedData[index], data };
        return updatedData;
      } else {
        return prevData;
      }
    }
    return addData(partsData[0] as Market[], partsData[1] as MarketData[]);
  },
  (data, parts) => {
    if (!parts[1].isUpdate && parts[1].delta) {
      return;
    }
    return data.find(
      (market) =>
        market.id ===
        (parts[1].delta as MarketDataUpdateFieldsFragment)?.marketId
    );
  }
);

export type MarketMaybeWithDataAndCandles = MarketMaybeWithData &
  MarketMaybeWithCandles;

export const marketListProvider = makeDerivedDataProvider<
  MarketMaybeWithDataAndCandles[],
  never,
  MarketsCandlesQueryVariables
>(
  [
    (callback, client) => marketsWithDataProvider(callback, client, undefined),
    marketsCandlesProvider,
  ],
  (parts) =>
    addCandles(parts[0] as MarketMaybeWithData[], parts[1] as MarketCandles[])
);

export const useMarketList = () => {
  const yesterday = useYesterday();
  const variables = useMemo(() => {
    return {
      since: new Date(yesterday).toISOString(),
      interval: Schema.Interval.INTERVAL_I1H,
    };
  }, [yesterday]);
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: marketListProvider,
    variables,
  });

  return {
    data,
    loading,
    error,
    reload,
  };
};

export const useProposedMarketsList = () => {
  return useDataProvider({
    dataProvider: proposedMarketsProvider,
    variables: undefined,
  });
};
