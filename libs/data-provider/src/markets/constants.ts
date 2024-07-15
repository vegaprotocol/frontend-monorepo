import { MarketState } from '@vegaprotocol/types';

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
];
