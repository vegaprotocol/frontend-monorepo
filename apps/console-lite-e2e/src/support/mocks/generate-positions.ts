import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  Positions,
  Positions_party_positionsConnection_edges_node,
} from '@vegaprotocol/positions';
import { MarketTradingMode } from '@vegaprotocol/types';

export const generatePositions = (
  override?: PartialDeep<Positions>
): Positions => {
  const nodes: Positions_party_positionsConnection_edges_node[] = [
    {
      __typename: 'Position',
      realisedPNL: '0',
      openVolume: '6',
      unrealisedPNL: '895000',
      averageEntryPrice: '1129935',
      updatedAt: '2022-07-28T15:09:34.441143Z',
      market: {
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        __typename: 'Market',
      },
    },
    {
      __typename: 'Position',
      realisedPNL: '100',
      openVolume: '20',
      unrealisedPNL: '895000',
      averageEntryPrice: '8509338',
      updatedAt: '2022-07-28T15:09:34.441143Z',
      market: {
        id: '0604e8c918655474525e1a95367902266ade70d318c2c908f0cca6e3d11dcb13',
        __typename: 'Market',
      },
    },
    {
      realisedPNL: '0',
      openVolume: '1',
      unrealisedPNL: '-22519',
      averageEntryPrice: '84400088',
      updatedAt: '2022-07-28T14:53:54.725477Z',
      market: {
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        __typename: 'Market',
      },
      __typename: 'Position',
    },
  ];

  const defaultResult: Positions = {
    party: {
      __typename: 'Party',
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      positionsConnection: {
        __typename: 'PositionConnection',
        edges: nodes.map((node) => {
          return {
            __typename: 'PositionEdge',
            node,
          };
        }),
      },
    },
  };

  return merge(defaultResult, override);
};

export const emptyPositions = () => {
  return {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      positionsConnection: { edges: null, __typename: 'PositionConnection' },
      __typename: 'Party',
    },
  };
};
