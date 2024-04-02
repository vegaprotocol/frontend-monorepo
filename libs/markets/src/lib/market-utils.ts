import { formatNumberPercentage, toBigNum } from '@vegaprotocol/utils';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type {
  Market,
  Candle,
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from '../';

export const getAsset = (market: Partial<Market>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const product = market.tradableInstrument.instrument.product;

  if (product.__typename === 'Perpetual' || product.__typename === 'Future') {
    return product.settlementAsset;
  }

  if (product.__typename === 'Spot') {
    return product.quoteAsset;
  }

  throw new Error('Failed to retrieve asset. Invalid product type');
};

export const getProductType = (market: Partial<Market>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error(
      'Failed to retrieve product type. Invalid tradable instrument'
    );
  }

  const type = market.tradableInstrument.instrument.product.__typename;

  if (!type) {
    throw new Error('Failed to retrieve asset. Invalid product type');
  }

  return type;
};

export const getQuoteName = (market: Partial<Market>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error(
      'Failed to retrieve quoteName. Invalid tradable instrument'
    );
  }

  const product = market.tradableInstrument.instrument.product;

  if (product.__typename === 'Perpetual' || product.__typename === 'Future') {
    return product.quoteName;
  }

  if (product.__typename === 'Spot') {
    return product.quoteAsset.symbol;
  }

  throw new Error('Failed to retrieve quoteName. Invalid product type');
};

export const sumFeesFactors = (fees: Market['fees']['factors']) => {
  if (!fees) return;

  return new BigNumber(fees.makerFee)
    .plus(fees.liquidityFee)
    .plus(fees.infrastructureFee)
    .toNumber();
};

export const totalFeesFactorsPercentage = (fees: Market['fees']['factors']) => {
  const total = fees && sumFeesFactors(fees);
  return total
    ? formatNumberPercentage(new BigNumber(total).times(100))
    : undefined;
};

export const filterAndSortMarkets = (markets: MarketMaybeWithData[]) => {
  const tradingModesOrdering = [
    MarketTradingMode.TRADING_MODE_CONTINUOUS,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    MarketTradingMode.TRADING_MODE_NO_TRADING,
  ];

  const activeMarkets = filterActiveMarkets(markets);

  const orderedMarkets = orderBy(
    activeMarkets.filter((m) => {
      const tradingMode = m.data?.marketTradingMode;
      return tradingMode !== MarketTradingMode.TRADING_MODE_NO_TRADING;
    }),
    ['marketTimestamps.open', 'id'],
    ['asc', 'asc']
  );
  return orderedMarkets.sort(
    (a, b) =>
      (a.data?.marketTradingMode
        ? tradingModesOrdering.indexOf(a.data?.marketTradingMode)
        : -1) -
      (b.data?.marketTradingMode
        ? tradingModesOrdering.indexOf(b.data?.marketTradingMode)
        : -1)
  );
};

export const filterActiveMarkets = (markets: MarketMaybeWithData[]) => {
  return markets.filter((m) => {
    return (
      m.data?.marketState &&
      [
        MarketState.STATE_ACTIVE,
        MarketState.STATE_SUSPENDED,
        MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
      ].includes(m.data.marketState)
    );
  });
};

export const filterClosedMarkets = (markets: MarketMaybeWithData[]) => {
  return markets.filter((m) => {
    return (
      m.data?.marketState &&
      [
        MarketState.STATE_SETTLED,
        MarketState.STATE_TRADING_TERMINATED,
        MarketState.STATE_CLOSED,
        MarketState.STATE_CANCELLED,
      ].includes(m.data.marketState)
    );
  });
};

export const filterProposedMarkets = (markets: MarketMaybeWithData[]) => {
  return markets.filter((m) => {
    return (
      m.data?.marketState &&
      [MarketState.STATE_PROPOSED].includes(m.data?.marketState)
    );
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

/**
 * The total number of contracts traded in the last 24 hours.
 *
 * @param candles
 * @returns the volume of a given set of candles
 */
export const calcCandleVolume = (candles: Candle[]): string | undefined =>
  candles &&
  candles.reduce((acc, c) => new BigNumber(acc).plus(c.volume).toString(), '0');

/**
 * The total number of contracts traded in the last 24 hours. (Total value of contracts traded in the last 24 hours)
 * The volume is calculated as the sum of the product of the volume and the high price of each candle.
 * The result is formatted using positionDecimalPlaces to account for the position size.
 * The result is formatted using marketDecimals to account for the market precision.
 *
 * @param candles
 * @param marketDecimals
 * @param positionDecimalPlaces
 * @returns the volume (in quote price) of a given set of candles
 */
export const calcCandleVolumePrice = (
  candles: Candle[],
  marketDecimals: number,
  positionDecimals: number
): string | undefined =>
  candles &&
  candles.reduce(
    (acc, c) =>
      new BigNumber(acc)
        // Using notional both price and size need conversion with decimals, we can acheive the same result by just combining them
        .plus(toBigNum(c.notional, marketDecimals + positionDecimals))
        .toString(),
    '0'
  );

/**
 * Calculates the traded factor of a given market.
 *
 * @param m
 * @returns
 */
export const calcTradedFactor = (m: MarketMaybeWithDataAndCandles) => {
  const volume = Number(calcCandleVolume(m.candles || []) || 0);
  const price = m.data?.markPrice ? Number(m.data.markPrice) : 0;
  const asset = getAsset(m);
  const quantum = Number(asset.quantum);
  const decimals = Number(asset.decimals);
  const fp = toBigNum(price, decimals);
  const fq = toBigNum(quantum, decimals);
  const factor = fq.multipliedBy(fp).multipliedBy(volume);
  return factor.toNumber();
};
