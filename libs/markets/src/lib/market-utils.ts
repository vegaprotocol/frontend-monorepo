import { formatNumberPercentage, toBigNum } from '@vegaprotocol/utils';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type {
  Market,
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from './markets-provider';
import { isSpot, isPerpetual, isFuture } from './product';
import type { Candle } from './market-candles-provider';

export const getAsset = (market: Pick<Market, 'tradableInstrument'>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const { product } = market.tradableInstrument.instrument;

  if (isPerpetual(product) || isFuture(product)) {
    return product.settlementAsset;
  }

  if (isSpot(product)) {
    return product.quoteAsset;
  }

  throw new Error('Failed to retrieve asset. Invalid product type');
};

export const getBaseAsset = (market: Pick<Market, 'tradableInstrument'>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const product = market.tradableInstrument.instrument.product;

  if (isSpot(product)) {
    return product.baseAsset;
  }

  throw new Error(
    `Failed to retrieve base asset. Invalid product type ${product.__typename}`
  );
};

export const getQuoteAsset = (market: Pick<Market, 'tradableInstrument'>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const { product } = market.tradableInstrument.instrument;

  if (isSpot(product)) {
    return product.quoteAsset;
  }

  throw new Error(
    `Failed to retreive quote asset. Invalid product type ${product.__typename}`
  );
};

export const getProductType = (market: Pick<Market, 'tradableInstrument'>) => {
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

export const getQuoteName = (market: Pick<Market, 'tradableInstrument'>) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error(
      'Failed to retrieve quoteName. Invalid tradable instrument'
    );
  }

  const instrument = market.tradableInstrument.instrument;
  const product = instrument.product;

  if (isPerpetual(product) || isFuture(product)) {
    return getQuoteUnit(instrument.metadata.tags);
  }

  if (isSpot(product)) {
    return product.quoteAsset.symbol;
  }

  throw new Error('Failed to retrieve quoteName. Invalid product type');
};

export const sumFeesFactors = (fees: Market['fees']['factors']) => {
  if (!fees) return;

  return new BigNumber(fees.makerFee)
    .plus(fees.liquidityFee)
    .plus(fees.infrastructureFee)
    .plus(fees.treasuryFee)
    .plus(fees.buyBackFee)
    .toNumber();
};

export const totalFeesFactorsPercentage = (fees: Market['fees']['factors']) => {
  const total = fees && sumFeesFactors(fees);
  return total
    ? formatNumberPercentage(new BigNumber(total).times(100))
    : undefined;
};

type MarketsFilter = <T extends MarketMaybeWithData>(markets: T[]) => T[];

export const filterAndSortMarkets: MarketsFilter = (markets) => {
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

export const OPEN_MARKETS_STATES = [
  MarketState.STATE_ACTIVE,
  MarketState.STATE_SUSPENDED,
  MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
  MarketState.STATE_PENDING,
];

export const CLOSED_MARKETS_STATES = [
  MarketState.STATE_SETTLED,
  MarketState.STATE_TRADING_TERMINATED,
  MarketState.STATE_CLOSED,
  MarketState.STATE_CANCELLED,
  MarketState.STATE_REJECTED,
];

export const PROPOSED_MARKETS_STATES = [MarketState.STATE_PROPOSED];

export const isMarketOpen = (state: MarketState) => {
  return OPEN_MARKETS_STATES.includes(state);
};

export const isMarketClosed = (state: MarketState) => {
  return CLOSED_MARKETS_STATES.includes(state);
};

export const isMarketProposed = (state: MarketState) => {
  return PROPOSED_MARKETS_STATES.includes(state);
};

export const isMarketInAuction = (tradingMode: MarketTradingMode) => {
  return [
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
  ].includes(tradingMode);
};

export const filterActiveMarkets: MarketsFilter = (markets) => {
  return markets.filter((m) => {
    return m.data?.marketState && isMarketOpen(m.data.marketState);
  });
};

export const filterClosedMarkets: MarketsFilter = (markets) => {
  return markets.filter((m) => {
    return m.data?.marketState && isMarketClosed(m.data.marketState);
  });
};

export const filterProposedMarkets: MarketsFilter = (markets) => {
  return markets.filter((m) => {
    return m.data?.marketState && isMarketProposed(m.data.marketState);
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
        // Using notional both price and size need conversion with decimals, we can achieve the same result by just combining them
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

/**
 * Gets the quote unit as specified in instrument tags
 */
export const getBaseUnit = (tags?: string[] | null) => {
  const value = tags
    ?.find((tag) => tag.startsWith('base:') || tag.startsWith('ticker:'))
    ?.replace(/^[^:]*:/, '');

  if (!value) {
    throw new Error(`could not get base unit from tags: ${tags?.join(', ')}`);
  }

  return value;
};

export const getQuoteUnit = (tags?: string[] | null) => {
  const value = tags
    ?.find((tag) => tag.startsWith('quote:'))
    ?.replace(/^[^:]*:/, '');

  if (!value) {
    throw new Error(`could not get quote unit from tags: ${tags?.join(', ')}`);
  }

  return value;
};
