import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  PositionsQuery,
  PositionFieldsFragment,
  MarginsQuery,
  MarginFieldsFragment,
} from './__generated__/Positions';

export const positionsQuery = (
  override?: PartialDeep<PositionsQuery>
): PositionsQuery => {
  const defaultResult: PositionsQuery = {
    party: {
      __typename: 'Party',
      id: 'vega-0', // VEGA PUBLIC KEY
      positionsConnection: {
        __typename: 'PositionConnection',
        edges: positionFields.map((node) => ({
          __typename: 'PositionEdge',
          node,
        })),
      },
    },
  };

  return merge(defaultResult, override);
};

export const marginsQuery = (
  override?: PartialDeep<MarginsQuery>
): MarginsQuery => {
  const defaultResult: MarginsQuery = {
    party: {
      id: 'vega-0', // VEGA PUBLIC KEY
      marginsConnection: {
        edges: marginsFields.map((node) => ({
          __typename: 'MarginEdge',
          node,
        })),
        __typename: 'MarginConnection',
      },
      __typename: 'Party',
    },
  };
  return merge(defaultResult, override);
};

const positionFields: PositionFieldsFragment[] = [
  {
    __typename: 'Position',
    realisedPNL: '230000',
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
    realisedPNL: '230000',
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

const marginsFields: MarginFieldsFragment[] = [
  {
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
  {
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
  {
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
];
