import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
  getNodes,
} from '@vegaprotocol/react-helpers';
import { MarketListDocument } from './__generated__/MarketList';
import type {
  MarketListQuery,
  MarketListItemFragment,
} from './__generated__/MarketList';
import type { MarketDataFieldsFragment } from './__generated__/MarketData';
import { marketsDataProvider } from './markets-data-provider';
import type {
  MarketCandles} from './markets-candles-provider';
import {
  marketsCandlesProvider
} from './markets-candles-provider';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

export const marketsProvider = makeDataProvider<
  MarketListQuery,
  MarketListItemFragment[],
  never,
  never
>({
  query: MarketListDocument,
  getData: (data) => getNodes<MarketListItemFragment>(data),
});

export const activeMarketsProvider = makeDerivedDataProvider<
  MarketListItemFragment[]
>([marketsProvider], ([markets]) => mapDataToMarketList(markets));

interface MarketsListData {
  markets: MarketListItemFragment[];
  marketsData: MarketDataFieldsFragment[];
  marketsCandles: MarketCandles[];
}

export const marketListProvider = makeDerivedDataProvider<MarketsListData>(
  [
    (callback, client) => activeMarketsProvider(callback, client),
    (callback, client) => marketsDataProvider(callback, client),
    marketsCandlesProvider,
  ],
  (parts) => {
    return {
      markets: parts[0] as MarketListItemFragment[],
      marketsData: parts[1] as MarketDataFieldsFragment[],
      marketsCandles: parts[2] as MarketCandles[],
    };
  }
);

export type MarketWithData = MarketListItemFragment & {
  data?: MarketDataFieldsFragment;
};

export const marketsWithDataProvider = makeDerivedDataProvider<
  MarketWithData[]
>([activeMarketsProvider, marketsDataProvider], (parts) =>
  (parts[0] as MarketListItemFragment[]).map((market) => ({
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
      interval: Interval.INTERVAL_I1H,
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
