import type { NodeCheckQuery } from './__generated__/NodeCheck';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const statisticsQuery = (
  override?: PartialDeep<NodeCheckQuery>
): NodeCheckQuery => {
  const defaultResult: NodeCheckQuery = {
    statistics: {
      __typename: 'Statistics',
      chainId: 'chain-id',
      blockHeight: '11',
      vegaTime: new Date().toISOString(),
    },
    networkParametersConnection: {
      __typename: 'NetworkParametersConnection',
      edges: [
        {
          __typename: 'NetworkParameterEdge',
          node: {
            __typename: 'NetworkParameter',
            key: 'a',
            value: '1',
          },
        },
      ],
    },
  };

  return merge(defaultResult, override);
};
