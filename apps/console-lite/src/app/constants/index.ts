import * as Schema from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';

export const DATE_FORMAT = 'dd MMMM yyyy HH:mm';

export const TRADABLE_STATES = {
  [Schema.MarketState.STATE_ACTIVE]: true,
};

export const IS_MARKET_TRADABLE = (market: Market) =>
  Boolean((market.state ?? '') in TRADABLE_STATES && market?.id);

export const MARKET_STATES_MAP: Record<Schema.MarketState | '', string> = {
  [Schema.MarketState.STATE_ACTIVE]: t('Active'),
  [Schema.MarketState.STATE_CANCELLED]: t('Cancelled'),
  [Schema.MarketState.STATE_CLOSED]: t('Closed'),
  [Schema.MarketState.STATE_PENDING]: t('Pending'),
  [Schema.MarketState.STATE_PROPOSED]: t('Proposed'),
  [Schema.MarketState.STATE_REJECTED]: t('Rejected'),
  [Schema.MarketState.STATE_SETTLED]: t('Settled'),
  [Schema.MarketState.STATE_SUSPENDED]: t('Suspended'),
  [Schema.MarketState.STATE_TRADING_TERMINATED]: t('TradingTerminated'),
  '': t('Unknown'),
};

export const NO_DATA_MESSAGE = t('No data to display');
