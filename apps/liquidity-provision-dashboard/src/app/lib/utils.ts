import BigNumber from 'bignumber.js';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { sumLiquidityCommitted } from '@vegaprotocol/liquidity';

import type {
  LiquidityProvisionMarket,
  LiquidityProvisionsEdge,
} from '@vegaprotocol/liquidity';
import type {
  Candle,
  MarketCandles,
  MarketWithCandles,
  MarketWithData,
} from '@vegaprotocol/market-list';

interface SettlementAsset {
  decimals: number;
  symbol: string;
}

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

const getCandle24hAgo = (marketId: string, candles24hAgo: MarketCandles[]) => {
  return candles24hAgo.find((c) => c.marketId === marketId)?.candles?.[0];
};

interface Provider {
  commitmentAmount: number;
  fee: string;
}

export type FormattedMarket = MarketWithData &
  MarketWithCandles & { providers?: Provider[] };

export interface FormattedMarkets {
  markets: FormattedMarket[];
}

const getChange = (candles: (Candle | null)[] | null, lastClose?: string) => {
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
  return ' - ';
};

const calcDayVolume = (candles: Candle[] = []) => {
  return candles
    .reduce((acc, c) => {
      return acc.plus(new BigNumber(c?.volume ?? 0));
    }, new BigNumber(candles[0]?.volume ?? 0))
    .toString();
};

const formatHealth = (liquidityEdges: LiquidityProvisionsEdge[]) => {
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

const getLiquidityForMarket = (
  marketId: string,
  markets: LiquidityProvisionMarket[]
) => {
  const liquidity = markets.find(
    (m) => m.id === marketId
  )?.liquidityProvisionsConnection;
  return liquidity?.edges || [];
};

export const addData = (
  markets: (MarketWithData & MarketWithCandles)[],
  marketsCandles24hAgo: MarketCandles[],
  marketsLiquidity: LiquidityProvisionMarket[]
) => {
  return markets.map((market) => {
    const dayVolume = calcDayVolume(market.candles as Candle[]);
    const candle24hAgo = getCandle24hAgo(market.id, marketsCandles24hAgo);

    const volumeChange = getChange(
      market.candles as Candle[],
      candle24hAgo?.close
    );

    const liquidity = getLiquidityForMarket(
      market.id,
      marketsLiquidity
    ) as LiquidityProvisionsEdge[];

    return {
      ...market,
      dayVolume,
      volumeChange,
      liquidityCommitted: sumLiquidityCommitted(liquidity),
      providers: formatHealth(liquidity),
    };
  });
};
