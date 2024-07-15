import {
  type Market,
  getAsset,
  filterAndSortMarkets,
} from '@vegaprotocol/data-provider';
import { priceChangePercentage, toBigNum, toQUSD } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';

/**
 * useTotalVolume24hCandles returns 24 hr candles with total volume
 * this is used to draw the sparkline
 *
 * @param activeMarkets
 * @returns number[]
 */
export const useTotalVolume24hCandles = (
  markets: Market[] | null
): number[] => {
  const candles = [];
  const activeMarkets = filterAndSortMarkets(compact(markets));
  if (!activeMarkets || activeMarkets.length === 0) return [];
  for (let i = 0; i < 24; i++) {
    const totalVolume24hr = activeMarkets.reduce((acc, market) => {
      const c = market.candlesConnection?.edges?.[i];
      if (!c) return acc;
      const asset = getAsset(market);
      const notional = toQUSD(c.node?.notional || '0', asset.quantum || 1);
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
 * @returns Market[]
 */
export const useTopGainers = (markets: Market[] | null) => {
  const activeMarkets = filterAndSortMarkets(compact(markets));
  return orderBy(
    activeMarkets,
    [
      (m) => {
        const edges = m.candlesConnection?.edges;
        if (!edges?.length) return 0;
        return Number(
          priceChangePercentage(
            compact(edges.filter((c) => c?.node.close !== '')).map(
              (c) => c?.node.close
            )
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
 * @returns Market[]
 */
export const useNewListings = (markets: Market[] | null) => {
  const activeMarkets = filterAndSortMarkets(compact(markets));
  return orderBy(
    activeMarkets,
    [(m) => new Date(m.marketTimestamps.open).getTime()],
    ['desc']
  ).slice(0, 3);
};
