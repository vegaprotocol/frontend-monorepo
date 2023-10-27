import BigNumber from 'bignumber.js';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

import type { MarketNodeFragment } from './../__generated__/MarketsLiquidity';
import { Intent } from '@vegaprotocol/ui-toolkit';

export type LiquidityProvisionMarket = MarketNodeFragment;

export interface Provider {
  commitmentAmount: string | undefined;
  fee: string | undefined;
}

export const sumLiquidityCommitted = (
  providers: Array<{ commitmentAmount: string | undefined }>
) => {
  return providers
    ? providers.reduce((total: number, { commitmentAmount = '0' }) => {
        return total + parseInt(commitmentAmount, 10);
      }, 0)
    : 0;
};

export const formatWithAsset = (
  value: string,
  settlementAsset: {
    decimals?: number;
    symbol?: string;
  }
) => {
  const { decimals, symbol } = settlementAsset;
  const formattedValue = decimals
    ? addDecimalsFormatNumber(value, decimals)
    : value;
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

export const displayChange = (value: string) => {
  return parseFloat(value) > 0 ? `+${value}` : value;
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
    const { fee = '0', commitmentAmount = '0' } = current;
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
    markets.find((m) => m.id === marketId)?.liquidityProvisions?.edges || [];

  return liquidity.map((l) => l?.node.current);
};

export const getTargetStake = (
  marketId: string,
  markets: LiquidityProvisionMarket[]
) => {
  return markets.find((m) => m.id === marketId)?.data?.targetStake || '0';
};

export const useCheckLiquidityStatus = ({
  suppliedStake,
  targetStake,
  triggeringRatio,
}: {
  suppliedStake: string | number;
  targetStake: string | number;
  triggeringRatio: string | number;
}): {
  status: Intent;
  percentage: BigNumber;
} => {
  // percentage supplied
  const percentage =
    targetStake && suppliedStake && new BigNumber(targetStake).gt(0)
      ? new BigNumber(suppliedStake).dividedBy(targetStake).multipliedBy(100)
      : new BigNumber(0);
  // IF supplied_stake >= target_stake THEN
  if (percentage.eq(0)) {
    return {
      status: Intent.None,
      percentage,
    };
  }
  if (new BigNumber(suppliedStake).gte(new BigNumber(targetStake))) {
    // show a green status, e.g. "🟢 $13,666,999 liquidity supplied"
    return {
      status: Intent.Success,
      percentage,
    };
    // ELSE IF supplied_stake > NETPARAM[market.liquidity.targetstake.triggering.ratio] * target_stake THEN
  } else if (
    new BigNumber(suppliedStake).gte(
      new BigNumber(targetStake).multipliedBy(triggeringRatio)
    )
  ) {
    // show an amber status, e.g. "🟠 $3,456,123 liquidity supplied"
    return {
      status: Intent.Warning,
      percentage,
    };
    // ELSE show a red status, e.g. "🔴 $600,002 liquidity supplied"
  } else {
    return {
      status: Intent.Danger,
      percentage,
    };
  }
};
