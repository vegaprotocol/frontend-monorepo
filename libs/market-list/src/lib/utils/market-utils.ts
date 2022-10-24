import { formatNumberPercentage } from '@vegaprotocol/react-helpers';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type { Market, Candle } from '../';

export const totalFees = (fees: Market['fees']['factors']) => {
  return fees
    ? new BigNumber(fees.makerFee)
        .plus(fees.liquidityFee)
        .plus(fees.infrastructureFee)
        .times(100)
    : undefined;
};

export const totalFeesPercentage = (fees: Market['fees']['factors']) => {
  const total = fees && totalFees(fees);
  return total ? formatNumberPercentage(total) : undefined;
};

export const filterAndSortMarkets = (markets: Market[]) => {
  const tradingModesOrdering = [
    MarketTradingMode.TRADING_MODE_CONTINUOUS,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    MarketTradingMode.TRADING_MODE_NO_TRADING,
  ];
  const orderedMarkets = orderBy(
    markets?.filter(
      (m) =>
        m.state !== MarketState.STATE_REJECTED &&
        m.tradingMode !== MarketTradingMode.TRADING_MODE_NO_TRADING
    ) || [],
    ['marketTimestamps.open', 'id'],
    ['asc', 'asc']
  );
  return orderedMarkets.sort(
    (a, b) =>
      tradingModesOrdering.indexOf(a.tradingMode) -
      tradingModesOrdering.indexOf(b.tradingMode)
  );
};

export const calcCandleLow = (candles: Candle[]): string | undefined => {
  return candles
    ?.reduce((acc: BigNumber, c) => {
      if (c?.low) {
        if (acc.isLessThan(new BigNumber(c.low))) {
          return acc;
        }
        return new BigNumber(c.low);
      }
      return acc;
    }, new BigNumber(candles?.[0]?.high ?? 0))
    .toString();
};

export const calcCandleHigh = (candles: Candle[]): string | undefined => {
  return candles
    ?.reduce((acc: BigNumber, c) => {
      if (c?.high) {
        if (acc.isGreaterThan(new BigNumber(c.high))) {
          return acc;
        }
        return new BigNumber(c.high);
      }
      return acc;
    }, new BigNumber(0))
    .toString();
};

export const calcCandleVolume = (candles: Candle[]): string | undefined =>
  candles &&
  candles.reduce((acc, c) => new BigNumber(acc).plus(c.volume).toString(), '0');
