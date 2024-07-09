import {
  filterAndSortMarkets,
  getAsset,
  type MarketMaybeWithCandles,
} from '@vegaprotocol/markets';
import { priceChangePercentage, toBigNum, toQUSD } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';

/**
 * useTotalVolume24hCandles returns 24 hr candles with total volume
 * this is used to draw the sparkline
 *
 * @param activeMarkets
 * @returns
 */
export const useTotalVolume24hCandles = (
  markets: MarketMaybeWithCandles[] | null
): number[] => {
  const candles = [];
  const activeMarkets = filterAndSortMarkets(compact(markets));
  if (!activeMarkets || activeMarkets.length === 0) return [];
  for (let i = 0; i < 24; i++) {
    const totalVolume24hr = activeMarkets.reduce((acc, market) => {
      const c = market.candles?.[i];
      if (!c) return acc;
      const asset = getAsset(market);
      const notional = toQUSD(c.notional, asset.quantum || 1);
      return toBigNum(
        notional,
        market.decimalPlaces + market.positionDecimalPlaces
      ).plus(acc);
    }, new BigNumber(0));
    candles.push(totalVolume24hr.toNumber());
  }
  return candles;
};

/**
 * useTopGainers returns the top 3 markets with highest gains, i.e. sorted by biggest 24h change
 *
 * @param markets
 * @returns MarketMaybeWithCandles[]
 */
export const useTopGainers = (
  markets: MarketMaybeWithCandles[] | null
): MarketMaybeWithCandles[] => {
  const activeMarkets = filterAndSortMarkets(compact(markets));
  return orderBy(
    activeMarkets,
    [
      (m) => {
        if (!m.candles?.length) return 0;
        return Number(
          priceChangePercentage(
            m.candles.filter((c) => c.close !== '').map((c) => c.close)
          )
        );
      },
    ],
    ['desc']
  ).slice(0, 3);
};

/**
 * useNewListings returns the top 3 markets with the most recent opening timestamps on the network
 *
 * @param activeMarkets
 * @returns MarketMaybeWithCandles[]
 */
export const useNewListings = (
  markets: MarketMaybeWithCandles[] | null
): MarketMaybeWithCandles[] => {
  const activeMarkets = filterAndSortMarkets(compact(markets));
  return orderBy(
    activeMarkets,
    [(m) => new Date(m.marketTimestamps.open).getTime()],
    ['desc']
  ).slice(0, 3);
};
