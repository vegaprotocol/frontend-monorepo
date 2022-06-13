import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export interface Market_market {
  __typename: 'Market';
  id: string;
  name: string;
}

export interface Market {
  market: Market_market | null;
}

export const generateMarket = (override?: PartialDeep<Market>): Market => {
  const defaultResult = {
    market: {
      id: 'market-0',
      name: 'MARKET NAME',
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
