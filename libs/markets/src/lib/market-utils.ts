import { formatNumberPercentage } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type { Market, Candle, MarketMaybeWithData } from '../';
const { MarketState, MarketTradingMode } = Schema;

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

export const filterAndSortMarkets = (markets: MarketMaybeWithData[]) => {
  const tradingModesOrdering = [
    MarketTradingMode.TRADING_MODE_CONTINUOUS,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    MarketTradingMode.TRADING_MODE_NO_TRADING,
  ];
  const orderedMarkets = orderBy(
    markets?.filter((m) => {
      const state = m.data?.marketState || m.state;
      const tradingMode = m.data?.marketTradingMode || m.tradingMode;
      return (
        state !== MarketState.STATE_REJECTED &&
        tradingMode !== MarketTradingMode.TRADING_MODE_NO_TRADING
      );
    }) || [],
    ['marketTimestamps.open', 'id'],
    ['asc', 'asc']
  );
  return orderedMarkets.sort(
    (a, b) =>
      tradingModesOrdering.indexOf(a.data?.marketTradingMode || a.tradingMode) -
      tradingModesOrdering.indexOf(b.data?.marketTradingMode || b.tradingMode)
  );
};

export const filterAndSortClosedMarkets = (markets: MarketMaybeWithData[]) => {
  return markets.filter((m) => {
    return [
      MarketState.STATE_SETTLED,
      MarketState.STATE_TRADING_TERMINATED,
    ].includes(m.data?.marketState || m.state);
  });
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

export const getAsset = (market: Pick<Market, 'tradableInstrument'>) => {
  const product = market.tradableInstrument.instrument.product;

  if (product.__typename === 'Perpetual' || product.__typename === 'Future') {
    return product.settlementAsset;
  }

  if (product.__typename === 'Spot') {
    // TODO to handle baseAsset for Spots
    throw new Error('Spots not yet implemented');
  }

  throw new Error('Invalid product type');
};
