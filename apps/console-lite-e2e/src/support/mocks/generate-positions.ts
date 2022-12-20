import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  PositionsQuery,
  PositionFieldsFragment,
  MarginsQuery,
} from '@vegaprotocol/positions';

export const generatePositions = (
  override?: PartialDeep<PositionsQuery>
): PositionsQuery => {
  const nodes: PositionFieldsFragment[] = [
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
        id: '57fbaa322e97cfc8bb5f1de048c37e033c41b1ac1906d3aed9960912a067ef5a',
        __typename: 'Market',
      },
      __typename: 'Position',
    },
  ];

  const defaultResult: PositionsQuery = {
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

export const emptyPositions = (): PositionsQuery => {
  return {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      positionsConnection: { edges: null, __typename: 'PositionConnection' },
      __typename: 'Party',
    },
  };
};

export const generateMargins = (): MarginsQuery => {
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
                id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
              },
              asset: {
                __typename: 'Asset',
                id: 'tDAI-id',
              },
            },
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
                id: '0604e8c918655474525e1a95367902266ade70d318c2c908f0cca6e3d11dcb13',
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
                id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
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
