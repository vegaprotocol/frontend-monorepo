import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import {
  useDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { activeMarketsProvider } from '@vegaprotocol/liquidity';
import type { MarketCandles } from '@vegaprotocol/market-list';
import { marketsCandlesProvider } from '@vegaprotocol/market-list';
import type {
  MarketsListData,
  LiquidityProvisionMarkets_marketsConnection_edges_node as Market,
} from '@vegaprotocol/liquidity';

const liquidityProvisionProvider = makeDerivedDataProvider<
  MarketsListData,
  never
>(
  [
    (callback, client, variables) =>
      activeMarketsProvider(callback, client, variables),
    (callback, client, variables) =>
      marketsCandlesProvider(callback, client, {
        ...variables,
        interval: Interval.INTERVAL_I1D,
      }),
  ],
  (parts) => {
    return {
      markets: parts[0] as Market[],
      marketsCandles24hAgo: parts[1] as MarketCandles[],
    };
  }
);

export const useMarketsLiquidity = () => {
  const variables = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return {
      since: new Date(yesterday * 1000).toISOString(),
      interval: Interval.INTERVAL_I1H,
    };
  }, []);

  const { data, loading, error } = useDataProvider<MarketsListData, never>({
    dataProvider: liquidityProvisionProvider,
    variables,
    noUpdate: true,
  });

  return {
    data,
    loading,
    error,
  };
};
