import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  Positions,
  Positions_party_positionsConnection_edges_node,
  Margins,
} from '@vegaprotocol/positions';

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
        id: 'market-0',
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
        id: 'market-1',
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
        id: 'market-2',
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

export const generateMargins = (): Margins => {
  return {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      marginsConnection: {
        edges: [
          {
            node: {
              __typename: 'MarginLevels',
              maintenanceLevel: '0',
              searchLevel: '0',
              initialLevel: '0',
              collateralReleaseLevel: '0',
              market: {
                __typename: 'Market',
                id: 'market-0',
              },
              asset: {
                __typename: 'Asset',
                id: 'tDAI-id',
              },
            },
            __typename: 'MarginEdge',
          },
          {
            node: {
              __typename: 'MarginLevels',
              maintenanceLevel: '0',
              searchLevel: '0',
              initialLevel: '0',
              collateralReleaseLevel: '0',
              market: {
                __typename: 'Market',
                id: 'market-1',
              },
              asset: {
                __typename: 'Asset',
                id: 'tDAI-id',
              },
            },
            __typename: 'MarginEdge',
          },
          {
            node: {
              __typename: 'MarginLevels',
              maintenanceLevel: '0',
              searchLevel: '0',
              initialLevel: '0',
              collateralReleaseLevel: '0',
              market: {
                __typename: 'Market',
                id: 'market-2',
              },
              asset: {
                __typename: 'Asset',
                id: 'tEURO-id',
              },
            },
            __typename: 'MarginEdge',
          },
        ],
        __typename: 'MarginConnection',
      },
      __typename: 'Party',
    },
  };
};
