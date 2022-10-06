import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type {
  LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset as SettlementAsset,
  LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection_edges_node as Candle,
  LiquidityProvisionMarkets_marketsConnection_edges_node as MarketNode,
  LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges as LiquidityEdges,
} from './../__generated__';
import type { MarketCandles } from '@vegaprotocol/market-list';

export type Market = MarketNode;

export interface MarketsListData {
  markets: Market[];
  marketsCandles24hAgo: MarketCandles[];
}

const tradingModesOrdering = [
  MarketTradingMode.TRADING_MODE_CONTINUOUS,
  MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
  MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
  MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  MarketTradingMode.TRADING_MODE_NO_TRADING,
];

const filterMarkets = (markets: Market[]) =>
  markets?.filter(
    (m) =>
      m.state !== MarketState.STATE_REJECTED &&
      m.tradingMode !== MarketTradingMode.TRADING_MODE_NO_TRADING
  );

const orderMarkets = (markets: Market[]) =>
  orderBy(markets, ['marketTimestamps.open', 'id'], ['asc', 'asc']);

const sortMarkets = (markets: Market[]) =>
  markets.sort(
    (a, b) =>
      tradingModesOrdering.indexOf(a.tradingMode) -
      tradingModesOrdering.indexOf(b.tradingMode)
  );

export const mapDataToMarketList = (markets: Market[]) => {
  const filteredMarkets = filterMarkets(markets) || [];
  const orderedMarkets = orderMarkets(filteredMarkets);
  const sortedMarkets = sortMarkets(orderedMarkets);
  return sortedMarkets;
};

const EMPTY_VALUE = ' - ';

export const getChange = (
  candles: (Candle | null)[] | null,
  lastClose?: string
) => {
  if (candles) {
    const firstCandle = candles.find((item) => item?.open);
    const first = parseInt(firstCandle?.open || '-1');

    const last =
      typeof lastClose === 'undefined'
        ? candles.reduceRight((aggr, item) => {
            if (aggr === -1 && item?.close) {
              aggr = parseInt(item.close);
            }
            return aggr;
          }, -1)
        : parseInt(lastClose);

    if (first !== -1 && last !== -1) {
      return Number(((last - first) / first) * 100).toFixed(3) + '%';
    }
  }
  return EMPTY_VALUE;
};

const calcDayVolume = (market: Market) => {
  const edges = market?.candlesConnection?.edges || [];
  return edges
    .reduce((acc, c) => {
      return acc.plus(new BigNumber(c?.node?.volume ?? 0));
    }, new BigNumber(edges[0]?.node.volume ?? 0))
    .toString();
};

export const formatWithAsset = (
  value: string,
  settlementAsset: SettlementAsset
) => {
  const formattedValue = addDecimalsFormatNumber(
    value,
    settlementAsset.decimals
  );
  const symbol = settlementAsset.symbol;
  return `${formattedValue} ${symbol}`;
};

export const sumLiquidityCommitted = (edges: LiquidityEdges[]) => {
  return edges
    ? edges.reduce(
        (
          total: number,
          { node: { commitmentAmount } }: { node: { commitmentAmount: string } }
        ) => {
          return total + parseInt(commitmentAmount, 10);
        },
        0
      )
    : 0;
};

const getCandle24hAgo = (marketId: string, candles24hAgo: MarketCandles[]) => {
  return candles24hAgo.find((c) => c.marketId === marketId)?.candles?.[0];
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
    };
  });
};
