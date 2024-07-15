import compact from 'lodash/compact';
import { type Market } from './use-markets';
import { type CandleFragment } from './__generated__/Markets';
import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/utils';
import { MarketState } from '@vegaprotocol/types';

export const isMarketActive = (m: Market) => {
  if (!m.data) return false;
  return [
    MarketState.STATE_ACTIVE,
    MarketState.STATE_SUSPENDED,
    MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
    MarketState.STATE_PENDING,
  ].includes(m.data.marketState);
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
