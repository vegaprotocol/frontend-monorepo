import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import { useYesterday } from '@vegaprotocol/react-helpers';
import {
  type MarketsCandlesQueryVariables,
  type MarketCandles,
  type MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';

import { marketListProvider } from '@vegaprotocol/markets';

import {
  LiquidityProvisionMarketsDocument,
  type LiquidityProvisionMarketsQuery,
} from './__generated__/MarketsLiquidity';
import {
  calcDayVolume,
  getCandle24hAgo,
  getChange,
  getLiquidityForMarket,
  sumLiquidityCommitted,
  getFeeLevels,
  getTargetStake,
} from './utils/liquidity-utils';
import { type Provider, type LiquidityProvisionMarket } from './utils';

export interface FeeLevels {
  commitmentAmount: number;
  fee: string;
}

export type Market = MarketMaybeWithDataAndCandles & {
  feeLevels: FeeLevels[];
  target: string;
  dayVolume: string;
  liquidityCommitted: number;
  volumeChange: string;
  tradableInstrument?: {
    instrument?: {
      metadata?: {
        tags?: string[] | null;
      };
    };
  };
};

export interface Markets {
  markets: Market[];
}

const getData = (
  responseData: LiquidityProvisionMarketsQuery | null
): LiquidityProvisionMarket[] | null => {
  return (
    responseData?.marketsConnection?.edges.map((edge) => {
      return edge.node;
    }) || null
  );
};

export const addData = (
  markets: MarketMaybeWithDataAndCandles[],
  marketsCandles24hAgo: MarketCandles[],
  marketsLiquidity: LiquidityProvisionMarket[]
) => {
  return markets.map((market) => {
    const dayVolume = calcDayVolume(market.candles);
    const candle24hAgo = getCandle24hAgo(market.id, marketsCandles24hAgo);

    const volumeChange = getChange(market.candles || [], candle24hAgo?.close);

    const liquidityProviders = getLiquidityForMarket(
      market.id,
      marketsLiquidity
    ) as Provider[];

    return {
      ...market,
      dayVolume,
      volumeChange,
      liquidityCommitted: sumLiquidityCommitted(liquidityProviders),
      feeLevels: getFeeLevels(liquidityProviders) || [],
      target: getTargetStake(market.id, marketsLiquidity),
    };
  });
};

export const liquidityMarketsProvider = makeDataProvider<
  LiquidityProvisionMarketsQuery,
  LiquidityProvisionMarket[],
  never,
  never
>({
  query: LiquidityProvisionMarketsDocument,
  getData,
});

const liquidityProvisionProvider = makeDerivedDataProvider<
  Market[],
  never,
  Exclude<MarketsCandlesQueryVariables, 'interval'>
>(
  [
    (callback, client, variables) =>
      marketListProvider(callback, client, {
        since: variables.since,
        interval: Schema.Interval.INTERVAL_I1D,
      }),
    (callback, client) => liquidityMarketsProvider(callback, client, undefined),
  ],
  (parts) => {
    return addData(
      parts[0] as MarketMaybeWithDataAndCandles[],
      parts[1] as MarketCandles[],
      parts[2] as LiquidityProvisionMarket[]
    );
  }
);

export const useMarketsLiquidity = () => {
  const yesterday = useYesterday();
  const variables = useMemo(() => {
    return {
      since: new Date(yesterday).toISOString(),
      interval: Schema.Interval.INTERVAL_I1H,
    };
  }, [yesterday]);

  const { data, loading, error } = useDataProvider({
    dataProvider: liquidityProvisionProvider,
    variables,
    skipUpdates: true,
  });

  return {
    data,
    loading,
    error,
  };
};
