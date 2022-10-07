import type {
  LiquidityProvisionMarkets_marketsConnection_edges_node as MarketNode,
  LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges as LiquidityEdges,
} from '@vegaprotocol/liquidity';
import type { MarketCandles } from '@vegaprotocol/market-list';

import {
  calcDayVolume,
  getCandle24hAgo,
  getChange,
  sumLiquidityCommitted,
} from '@vegaprotocol/liquidity';

export type Market = MarketNode;

export interface MarketsListData {
  markets: Market[];
  marketsCandles24hAgo: MarketCandles[];
}

const formatHealth = (liquidityEdges: LiquidityEdges[]) => {
  const lp = liquidityEdges.reduce(
    (
      total: { [x: string]: number },
      current: { node: { fee: string; commitmentAmount: string } }
    ) => {
      const {
        node: { fee, commitmentAmount },
      } = current;
      const ca = parseInt(commitmentAmount, 10);

      return {
        ...total,
        [fee]: total[fee] ? total[fee] + ca : ca,
      };
    },
    {}
  );

  const sortedProviders = Object.keys(lp)
    .sort()
    .map((p) => ({ fee: p, commitmentAmount: lp[p] }));

  return sortedProviders;
};

export const formatMarketLists = ({
  markets,
  marketsCandles24hAgo,
}: MarketsListData) => {
  return markets.map((market) => {
    const dayVolume = calcDayVolume(market);
    const candle24hAgo = getCandle24hAgo(market.id, marketsCandles24hAgo);

    const candles =
      market.candlesConnection?.edges?.map((c) => (c ? c.node : null)) || null;
    const volumeChange = getChange(candles, candle24hAgo?.close);

    const liquidity = market.liquidityProvisionsConnection?.edges || [];

    return {
      ...market,
      dayVolume,
      volumeChange,
      liquidityCommitted: sumLiquidityCommitted(liquidity as LiquidityEdges[]),
      providers: formatHealth(liquidity as LiquidityEdges[]),
    };
  });
};
