import type { SimpleMarkets_markets } from '../components/simple-market-list/__generated__/SimpleMarkets';

export const DATE_FORMAT = 'dd MMMM yyyy HH:mm';
export const EXPIRE_DATE_FORMAT = 'MMM dd';

export const TRADABLE_STATES = {
  Active: true,
};

export const IS_MARKET_TRADABLE = (market: SimpleMarkets_markets) =>
  Boolean((market.data?.market.state ?? '') in TRADABLE_STATES && market?.id);
