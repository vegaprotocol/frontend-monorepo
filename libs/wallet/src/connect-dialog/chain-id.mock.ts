import type { ChainIdQuery } from './__generated__/ChainId';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const chainIdQuery = (
  override?: PartialDeep<ChainIdQuery>
): ChainIdQuery => {
  const defaultResult = {
    statistics: {
      __typename: 'Statistics',
      chainId: 'test-id',
    },
  };

  return merge(defaultResult, override);
};
