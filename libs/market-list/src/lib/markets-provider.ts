import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
  getNodes,
} from '@vegaprotocol/react-helpers';
import {
  MarketListDocument
} from './__generated__/Markets';
import type {
  MarketListQuery,
  MarketItemFieldsFragment,
} from './__generated__/Markets';
import type {
  MarketDataFieldsFragment,
} from './__generated__/MarketData';
import { marketsDataProvider } from './markets-data-provider';
import { marketsCandlesProvider } from './markets-candles-provider';
import type { MarketCandles } from './markets-candles-provider';
import { useMemo } from 'react';
import { Schema } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

const getData = (responseData: MarketListQuery) => getNodes<MarketItemFieldsFragment>(responseData.marketsConnection)

export const marketsProvider = makeDataProvider<
  MarketListQuery,
  MarketItemFieldsFragment[],
  never,
  never
>({
  query: MarketListDocument,
  getData,
});

export const activeMarketsProvider = makeDerivedDataProvider<MarketItemFieldsFragment[], never>(
  [marketsProvider],
  ([markets]) => mapDataToMarketList(markets)
);

export interface MarketsListData {
  markets: MarketItemFieldsFragment[];
  marketsData: MarketDataFieldsFragment[];
  marketsCandles: MarketCandles[];
}

export const marketListProvider = makeDerivedDataProvider<
  MarketsListData,
  never
>(
  [
    (callback, client) => activeMarketsProvider(callback, client),
    (callback, client) => marketsDataProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) => {
    return {
      markets: parts[0] as MarketItemFieldsFragment[],
      marketsData: parts[1] as MarketDataFieldsFragment[],
      marketsCandles: parts[2] as MarketCandles[],
    };
  }
);

export type MarketWithData = MarketItemFieldsFragment & { data?: MarketDataFieldsFragment };

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[],
  never
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  (parts[0] as MarketItemFieldsFragment[]).map((market) => ({
    ...market,
    data: (parts[1] as MarketDataFieldsFragment[]).find(
      (data) => data.market.id === market.id
    ),
  }))
);

export const useMarketList = () => {
  const variables = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return {
      since: new Date(yesterday * 1000).toISOString(),
      interval: Schema.Interval.INTERVAL_I1H,
    };
  }, []);
  const { data, loading, error } = useDataProvider<MarketsListData, never>({
    dataProvider: marketListProvider,
    variables,
    noUpdate: true,
  });

  return {
    data,
    loading,
    error,
  };
};
