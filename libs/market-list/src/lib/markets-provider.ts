import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import type {
  MarketsQuery,
  MarketFieldsFragment,
} from './__generated__/markets';
import { marketsDataProvider } from './markets-data-provider';
import { marketsCandlesProvider } from './markets-candles-provider';
import type { MarketData } from './market-data-provider';
import type { MarketCandles } from './markets-candles-provider';
import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import { filterAndSortMarkets } from './utils';
import { MarketsDocument } from './__generated__/markets';

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
  fetchPolicy: 'cache-first',
});

const marketProvider = makeDerivedDataProvider<
  Market,
  never,
  { marketId: string }
>(
  [marketsProvider],
  ([markets], variables) =>
    ((markets as ReturnType<typeof getData>) || []).find(
      (market) => market.id === variables?.marketId
    ) || null
);

export const useMarket = (marketId?: string) => {
  const variables = useMemo(() => ({ marketId: marketId || '' }), [marketId]);
  const { data } = useDataProvider({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });
  return data;
};

export const activeMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => filterAndSortMarkets(markets)
);

export type MarketWithCandles = Market & { candles?: Candle[] };

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
  MarketWithCandles[],
  never
>(
  [
    (callback, client) => activeMarketsProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) => addCandles(parts[0] as Market[], parts[1] as MarketCandles[])
);

export type MarketWithData = Market & { data?: MarketData };

const addData = <T extends Market>(markets: T[], marketsData: MarketData[]) =>
  markets.map((market) => ({
    ...market,
    data: marketsData.find((data) => data.market.id === market.id),
  }));

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[],
  never
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  addData(parts[0] as Market[], parts[1] as MarketData[])
);

export const marketListProvider = makeDerivedDataProvider<
  (MarketWithData & MarketWithCandles)[],
  never
>(
  [
    (callback, client) => marketsWithDataProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) =>
    addCandles(parts[0] as MarketWithCandles[], parts[1] as MarketCandles[])
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
