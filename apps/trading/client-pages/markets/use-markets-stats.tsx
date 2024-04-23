import type { MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { AccountType } from '@vegaprotocol/types';
import { addDecimal, priceChangePercentage } from '@vegaprotocol/utils';
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
) => {
  const candles = [];
  if (!activeMarkets || activeMarkets.length === 0) return [];
  for (let i = 0; i < 24; i++) {
    const totalVolume24hr = activeMarkets.reduce((acc, market) => {
      const c = market.candles?.[i];
      if (!c) return acc;
      return (
        acc +
        Number(
          addDecimal(
            c.notional,
            market.decimalPlaces + market.positionDecimalPlaces
          )
        )
      );
    }, 0);
    candles.push(totalVolume24hr);
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
 * useTVL returns the total value locked in the network
 * by summing the balances of all insurance accounts
 *
 * @param activeMarkets
 * @returns MarketMaybeWithCandles[] | null
 */
export const useTVL = (activeMarkets: MarketMaybeWithCandles[] | null) => {
  return activeMarkets?.reduce((acc, market) => {
    const accounts = market.accountsConnection?.edges
      ?.filter((e) => e?.node?.type === AccountType.ACCOUNT_TYPE_INSURANCE)
      .map((e) => e?.node);
    const balance = accounts?.reduce((acc, a) => {
      return acc + Number(addDecimal(a?.balance || 0, a?.asset.decimals || 0));
    }, 0);
    if (!balance) return acc;
    return acc + balance;
  }, 0);
};
