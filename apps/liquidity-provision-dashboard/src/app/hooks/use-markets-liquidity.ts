import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import {
  useDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { liquidityMarketsProvider } from '@vegaprotocol/liquidity';
import type {
  MarketCandles,
  MarketWithCandles,
  MarketWithData,
} from '@vegaprotocol/market-list';
import {
  marketsCandlesProvider,
  marketListProvider,
} from '@vegaprotocol/market-list';
import type { LiquidityProvisionMarket } from '@vegaprotocol/liquidity';

import type { FormattedMarkets } from './../lib/utils';
import { addData } from './../lib/utils';

const liquidityProvisionProvider = makeDerivedDataProvider<
  FormattedMarkets,
  never
>(
  [
    marketListProvider,
    (callback, client, variables) =>
      marketsCandlesProvider(callback, client, {
        ...variables,
        interval: Interval.INTERVAL_I1D,
      }),
    liquidityMarketsProvider,
  ],
  (parts) => {
    const data = addData(
      parts[0] as (MarketWithData & MarketWithCandles)[],
      parts[1] as MarketCandles[],
      parts[2] as LiquidityProvisionMarket[]
    );
    return { markets: data };
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

  const { data, loading, error } = useDataProvider({
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
