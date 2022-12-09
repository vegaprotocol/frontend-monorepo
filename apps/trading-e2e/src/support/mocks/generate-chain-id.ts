import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const generateChainId = (
  override?: PartialDeep<ChainIdQuery>
): ChainIdQuery => {
  const defaultResult = {
    statistics: {
      __typename: 'Statistics',
      chainId: 'stagnet3',
    },
  };

  return merge(defaultResult, override);
};
