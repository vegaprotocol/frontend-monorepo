import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { type Market } from './use-markets';
import { type CandleFragment } from './__generated__/Markets';
import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/utils';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import { OPEN_MARKETS_STATES } from './constants';

export const isMarketActive = (m: Market) => {
  if (!m.data) return false;
  return [
    MarketState.STATE_ACTIVE,
    MarketState.STATE_SUSPENDED,
    MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
    MarketState.STATE_PENDING,
  ].includes(m.data.marketState);
};

export const filterActiveMarkets = (markets: Market[]) => {
  return markets.filter((m) => {
    return (
      m.data?.marketState && OPEN_MARKETS_STATES.includes(m.data.marketState)
    );
  });
};

export const filterAndSortMarkets = (markets: Market[]) => {
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

export const getAsset = (market: Market) => {
  if (!market.tradableInstrument?.instrument.product) {
    throw new Error('Failed to retrieve asset. Invalid tradable instrument');
  }

  const { product } = market.tradableInstrument.instrument;

  if (product.__typename === 'Future' || product.__typename === 'Perpetual') {
    return product.settlementAsset;
  }

  if (product.__typename === 'Spot') {
    return product.quoteAsset;
  }

  throw new Error('Failed to retrieve asset. Invalid product type');
};

export const calcCandleVolume = (
  candles: CandleFragment[]
): string | undefined =>
  candles &&
  candles.reduce((acc, c) => BigNumber(acc).plus(c.volume).toString(), '0');

export const calcTradedFactor = (m: Market) => {
  const candleData = compact(
    (m.candlesConnection?.edges || []).map((e) => e?.node)
  );
  const volume = Number(calcCandleVolume(candleData) || 0);
  const price = m.data?.markPrice ? Number(m.data.markPrice) : 0;
  const asset = getAsset(m);
  const quantum = Number(asset.quantum);
  const decimals = Number(asset.decimals);
  const fp = toBigNum(price, decimals);
  const fq = toBigNum(quantum, decimals);
  const factor = fq.multipliedBy(fp).multipliedBy(volume);
  return factor.toNumber();
};
