import { PositionStatus } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  PositionsQuery,
  PositionFieldsFragment,
} from './__generated__/Positions';

import type {
  MarginsQuery,
  MarginFieldsFragment,
} from '@vegaprotocol/accounts';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';

export const positionsQuery = (
  override?: PartialDeep<PositionsQuery>
): PositionsQuery => {
  const defaultResult: PositionsQuery = {
    positions: {
      __typename: 'PositionConnection',
      edges: positionFields.map((node) => ({
        __typename: 'PositionEdge',
        node,
      })),
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
    openVolume: '-6',
    unrealisedPNL: '895000',
    averageEntryPrice: '1129935',
    updatedAt: '2022-07-28T15:09:34.441143Z',
    market: {
      id: 'market-0',
      __typename: 'Market',
    },
    party: {
      id: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
      __typename: 'Party',
    },
    lossSocializationAmount: '0',
    positionStatus: PositionStatus.POSITION_STATUS_UNSPECIFIED,
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
    party: {
      id: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
      __typename: 'Party',
    },
    lossSocializationAmount: '0',
    positionStatus: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  },
  {
    __typename: 'Position',
    realisedPNL: '-230000',
    openVolume: '1',
    unrealisedPNL: '-22519',
    averageEntryPrice: '84400088',
    updatedAt: '2022-07-28T14:53:54.725477Z',
    market: {
      id: 'market-2',
      __typename: 'Market',
    },
    party: {
      id: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
      __typename: 'Party',
    },
    lossSocializationAmount: '0',
    positionStatus: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  },
  {
    __typename: 'Position',
    realisedPNL: '-303295252',
    openVolume: '0',
    unrealisedPNL: '0',
    averageEntryPrice: '6126312',
    updatedAt: '2022-07-28T14:53:54.725477Z',
    positionStatus: PositionStatus.POSITION_STATUS_CLOSED_OUT,
    lossSocializationAmount: '261',
    market: {
      id: 'market-3',
      __typename: 'Market',
    },
    party: {
      id: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
      __typename: 'Party',
    },
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

export const singleRow: Position = {
  partyId: 'partyId',
  assetId: 'asset-id',
  assetSymbol: 'BTC',
  averageEntryPrice: '133',
  currentLeverage: 1.1,
  assetDecimals: 2, // this is settlementAsset.decimals
  quantum: '0.1',
  lossSocializationAmount: '0',
  marginAccountBalance: '12345600',
  marketDecimalPlaces: 1,
  marketId: 'string',
  marketCode: 'ETHBTC.QM21',
  marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  marketState: Schema.MarketState.STATE_ACTIVE,
  markPrice: '123',
  notional: '12300',
  openVolume: '100',
  positionDecimalPlaces: 0,
  realisedPNL: '123',
  status: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  totalBalance: '123456',
  unrealisedPNL: '456',
  updatedAt: '2022-07-27T15:02:58.400Z',
  productType: 'Future',
};
