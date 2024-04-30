import { getAsset, type MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { AccountType } from '@vegaprotocol/types';
import { priceChangePercentage, toBigNum, toQUSD } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash';

/**
 * useTotalVolume24hCandles returns 24 hr candles with total volume
 * this is used to draw the sparkline
 *
 * @param activeMarkets
 * @returns
 */
export const useTotalVolume24hCandles = (
  activeMarkets: MarketMaybeWithCandles[] | null
): number[] => {
  const candles = [];
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
 * @param activeMarkets
 * @returns MarketMaybeWithCandles[]
 */
export const useTopGainers = (
  activeMarkets: MarketMaybeWithCandles[] | null
): MarketMaybeWithCandles[] => {
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
  activeMarkets: MarketMaybeWithCandles[] | null
): MarketMaybeWithCandles[] => {
  return orderBy(
    activeMarkets,
    [(m) => new Date(m.marketTimestamps.open).getTime()],
    ['desc']
  ).slice(0, 3);
};

/**
 * useTotalVolumeLocked returns the total value locked in the network
 * by summing the balances of all insurance accounts
 *
 * @param activeMarkets
 * @returns MarketMaybeWithCandles[] | null
 */
export const useTotalVolumeLocked = (
  activeMarkets: MarketMaybeWithCandles[] | null
) => {
  const tvl = activeMarkets?.reduce((acc, market) => {
    const accounts = market.accountsConnection?.edges
      ?.filter((e) => e?.node?.type === AccountType.ACCOUNT_TYPE_INSURANCE)
      .map((e) => e?.node);
    const balance = accounts?.reduce((acc, a) => {
      const balance = toQUSD(a?.balance || 0, a?.asset.quantum || 1);
      return balance.plus(acc);
    }, new BigNumber(0));
    if (!balance) return acc;
    return balance.plus(acc);
  }, new BigNumber(0));
  return tvl?.toNumber();
};
