import { MarketState } from '@vegaprotocol/types';

// Used for sort order and filter
const MARKET_TEMPLATE = [
  MarketState.STATE_ACTIVE,
  MarketState.STATE_SUSPENDED,
  MarketState.STATE_PENDING,
  MarketState.STATE_SUSPENDED_VIA_GOVERNANCE,
];

export const isMarketActive = (state: MarketState) => {
  return MARKET_TEMPLATE.includes(state);
};
