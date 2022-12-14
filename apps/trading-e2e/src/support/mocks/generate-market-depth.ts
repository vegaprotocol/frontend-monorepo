import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { MarketDepthQuery } from '../../../../../libs/market-depth/src/lib/__generated__/MarketDepth';

export const generateMarketDepth = (
  override?: PartialDeep<MarketDepthQuery>
): MarketDepthQuery => {
  const defaultResult: MarketDepthQuery = {
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
