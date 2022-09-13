import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { MarketDepth } from '../../../../../libs/market-depth/src/lib/__generated__/MarketDepth';

export const generateMarketDepth = (
  override?: PartialDeep<MarketDepth>
): MarketDepth => {
  const defaultResult: MarketDepth = {
    market: {
      id: 'market-0',
      depth: {
        __typename: 'MarketDepth',
        buy: [],
        sell: [],
        sequenceNumber: '',
      },
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
