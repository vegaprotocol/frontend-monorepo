import BigNumber from 'bignumber.js';
import { addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';

import type { LiquidityProvisionMarkets_marketsConnection_edges_node } from './../__generated__/LiquidityProvisionMarkets';

export type LiquidityProvisionMarket =
  LiquidityProvisionMarkets_marketsConnection_edges_node;

export interface Provider {
  commitmentAmount: string;
  fee: string;
}

export const sumLiquidityCommitted = (
  providers: Array<{ commitmentAmount: string }>
) => {
  return providers
    ? providers.reduce((total: number, { commitmentAmount }) => {
        return total + parseInt(commitmentAmount, 10);
      }, 0)
    : 0;
};

export const formatWithAsset = (
  value: string,
  settlementAsset: {
    decimals: number;
    symbol: string;
  }
) => {
  const formattedValue = addDecimalsFormatNumber(
    value,
    settlementAsset.decimals
  );
  const symbol = settlementAsset.symbol;
  return `${formattedValue} ${symbol}`;
};

interface Candle {
  open: string;
  close: string;
  volume: string;
}

export const getCandle24hAgo = (
  marketId: string,
  candles24hAgo: { marketId: string; candles: Candle[] | undefined }[]
) => {
  return candles24hAgo.find((c) => c.marketId === marketId)?.candles?.[0];
};

export const EMPTY_VALUE = ' - ';
export const getChange = (candles: (Candle | null)[], lastClose?: string) => {
  const firstCandle = candles.find((item) => item?.open);
  if (firstCandle) {
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

export const calcDayVolume = (candles: Array<{ volume: string }> = []) => {
  return candles
    .reduce((acc, c) => {
      return acc.plus(new BigNumber(c?.volume ?? 0));
    }, new BigNumber(0))
    .toString();
};

export const getFeeLevels = (providers: Provider[]) => {
  const lp = providers.reduce((total: { [x: string]: number }, current) => {
    const { fee, commitmentAmount } = current;
    const ca = parseInt(commitmentAmount, 10);

    return {
      ...total,
      [fee]: total[fee] ? total[fee] + ca : ca,
    };
  }, {});

  const sortedProviders = Object.keys(lp)
    .sort()
    .map((p) => ({ fee: p, commitmentAmount: lp[p] }));

  return sortedProviders;
};

export const getLiquidityForMarket = (
  marketId: string,
  markets: LiquidityProvisionMarket[]
) => {
  const liquidity =
    markets.find((m) => m.id === marketId)?.liquidityProvisionsConnection
      ?.edges || [];

  return liquidity.map((l) => l?.node);
};

export const getTargetStake = (
  marketId: string,
  markets: LiquidityProvisionMarket[]
) => {
  return markets.find((m) => m.id === marketId)?.data?.targetStake || '0';
};
