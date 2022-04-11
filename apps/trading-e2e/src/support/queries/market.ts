import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

interface Market_market {
  __typename: 'Market';
  id: string;
  name: string;
}

interface Market {
  market: Market_market | null;
}

export interface MarketVariables {
  marketId: string;
}
export const generateMarket = (override?: PartialDeep<Market>): Market => {
  const defaultResult = {
    market: {
      id: 'market-id',
      name: 'MARKET NAME',
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
