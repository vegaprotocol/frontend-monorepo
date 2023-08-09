import { useYesterday } from '@vegaprotocol/react-helpers';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import type {
  MarketsQuery,
  MarketFieldsFragment,
} from './__generated__/markets';
import type { MarketsCandlesQueryVariables } from './__generated__/markets-candles';

import {
  marketsDataProvider,
  marketsLiveDataProvider,
  mapMarketDataUpdateToMarketData,
} from './markets-data-provider';
import { marketDataProvider } from './market-data-provider';
import { marketsCandlesProvider } from './markets-candles-provider';
import type { MarketData } from './market-data-provider';
import type { MarketDataUpdateFieldsFragment } from './__generated__';
import type { MarketCandles } from './markets-candles-provider';
import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import {
  filterAndSortClosedMarkets,
  filterAndSortMarkets,
} from './market-utils';
import { MarketsDocument } from './__generated__/markets';
import type { Candle } from './market-candles-provider';
import type { SuccessorMarketIdsQuery } from './__generated__/SuccessorMarket';
import { SuccessorMarketIdsDocument } from './__generated__';

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
  fetchPolicy: 'cache-first',
});

export const marketsMapProvider = makeDerivedDataProvider<
  Record<string, Market>,
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
      {} as Record<string, Market>
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

export const activeMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => filterAndSortMarkets(markets)
);

export const closedMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => filterAndSortClosedMarkets(markets)
);

export type MarketMaybeWithCandles = Market & { candles?: Candle[] };

const addCandles = <T extends Market>(
  markets: T[],
  marketsCandles: MarketCandles[]
) =>
  markets.map((market) => ({
    ...market,
    candles: marketsCandles.find((data) => data.marketId === market.id)
      ?.candles,
  }));

export const marketsWithCandlesProvider = makeDerivedDataProvider<
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

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const closedMarketsWithDataProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([closedMarketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const allMarketsWithDataProvider = makeDerivedDataProvider<
  MarketMaybeWithData[],
  never
>([marketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const allMarketsWithLiveDataProvider = makeDerivedDataProvider<
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
        (parts[1].delta as MarketDataUpdateFieldsFragment).marketId
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

export type MarketSuccessors = {
  __typename?: 'Market';
  id: string;
  successorMarketID?: string | null;
  parentMarketID?: string | null;
};
const getMarketSuccessorData = (
  responseData: SuccessorMarketIdsQuery | null
): MarketSuccessors[] | null =>
  responseData?.marketsConnection?.edges.map((edge) => edge.node) || null;

export const marketSuccessorProvider = makeDataProvider<
  SuccessorMarketIdsQuery,
  MarketSuccessors[],
  never,
  never
>({
  query: SuccessorMarketIdsDocument,
  getData: getMarketSuccessorData,
  fetchPolicy: 'no-cache',
});

export const useSuccessorMarketIds = (marketId: string) => {
  const { data } = useDataProvider({
    dataProvider: marketSuccessorProvider,
    variables: undefined,
    skip: !marketId,
  });
  return data?.find((item) => item.id === marketId) ?? null;
};
