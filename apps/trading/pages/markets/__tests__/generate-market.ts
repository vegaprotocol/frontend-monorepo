import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { Market } from '../__generated__/Market';

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
