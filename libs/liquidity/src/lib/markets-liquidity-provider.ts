import { useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';

import type {
  MarketCandles,
  MarketWithCandles,
  MarketWithData,
} from '@vegaprotocol/market-list';

import {
  marketsCandlesProvider,
  marketListProvider,
} from '@vegaprotocol/market-list';

import type { LiquidityProvisionMarketsQuery } from './__generated__/MarketsLiquidity';
import { LiquidityProvisionMarketsDocument } from './__generated__/MarketsLiquidity';

import {
  calcDayVolume,
  getCandle24hAgo,
  getChange,
  getLiquidityForMarket,
  sumLiquidityCommitted,
  getFeeLevels,
  getTargetStake,
} from './utils/liquidity-utils';
import type { Provider, LiquidityProvisionMarket } from './utils';
import { proposalsListDataProvider } from '@vegaprotocol/governance';
import type { Proposal } from '@vegaprotocol/types';

export interface FeeLevels {
  commitmentAmount: number;
  fee: string;
}

export type Market = MarketWithData &
  MarketWithCandles & {
    feeLevels: FeeLevels[];
    target: string;
    dayVolume: string;
    liquidityCommitted: number;
    volumeChange: string;
    proposal?: Proposal;
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
  responseData: LiquidityProvisionMarketsQuery
): LiquidityProvisionMarket[] | null => {
  return (
    responseData?.marketsConnection?.edges.map((edge) => {
      return edge.node;
    }) || null
  );
};

export const addData = (
  markets: (MarketWithData & MarketWithCandles)[],
  marketsCandles24hAgo: MarketCandles[],
  marketsLiquidity: LiquidityProvisionMarket[],
  proposals: Proposal[]
) => {
  return markets.map((market) => {
    const dayVolume = calcDayVolume(market.candles);
    const candle24hAgo = getCandle24hAgo(market.id, marketsCandles24hAgo);

    const volumeChange = getChange(market.candles || [], candle24hAgo?.close);

    const liquidityProviders = getLiquidityForMarket(
      market.id,
      marketsLiquidity
    ) as Provider[];

    const proposalForMarket =
      proposals && proposals.find((p) => p.id === market.id);

    return {
      ...market,
      dayVolume,
      volumeChange,
      liquidityCommitted: sumLiquidityCommitted(liquidityProviders),
      feeLevels: getFeeLevels(liquidityProviders) || [],
      target: getTargetStake(market.id, marketsLiquidity),
      proposal: proposalForMarket,
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

const liquidityProvisionProvider = makeDerivedDataProvider<Markets, never>(
  [
    marketListProvider,
    (callback, client, variables) =>
      marketsCandlesProvider(callback, client, {
        ...variables,
        interval: Schema.Interval.INTERVAL_I1D,
      }),
    liquidityMarketsProvider,
    proposalsListDataProvider,
  ],
  (parts) => {
    const data = addData(
      parts[0] as (MarketWithData & MarketWithCandles)[],
      parts[1] as MarketCandles[],
      parts[2] as LiquidityProvisionMarket[],
      parts[3] as Proposal[]
    );
    return { markets: data };
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
