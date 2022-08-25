import type { SimpleMarkets_markets } from '../components/simple-market-list/__generated__/SimpleMarkets';
import { MarketState } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

export const DATE_FORMAT = 'dd MMMM yyyy HH:mm';
export const EXPIRE_DATE_FORMAT = 'MMM dd';

export const TRADABLE_STATES = {
  [MarketState.STATE_ACTIVE]: true,
};

export const IS_MARKET_TRADABLE = (market: SimpleMarkets_markets) =>
  Boolean((market.data?.market.state ?? '') in TRADABLE_STATES && market?.id);

export const MARKET_STATES_MAP: Record<MarketState | '', string> = {
  [MarketState.STATE_ACTIVE]: t('Active'),
  [MarketState.STATE_CANCELLED]: t('Cancelled'),
  [MarketState.STATE_CLOSED]: t('Closed'),
  [MarketState.STATE_PENDING]: t('Pending'),
  [MarketState.STATE_PROPOSED]: t('Proposed'),
  [MarketState.STATE_REJECTED]: t('Rejected'),
  [MarketState.STATE_SETTLED]: t('Settled'),
  [MarketState.STATE_SUSPENDED]: t('Suspended'),
  [MarketState.STATE_TRADING_TERMINATED]: t('TradingTerminated'),
  '': t('Unknown'),
};
