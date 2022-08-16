import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  PositionsMetrics,
  PositionsMetrics_party_positionsConnection_edges_node,
} from '@vegaprotocol/positions';
import { MarketTradingMode, AccountType } from '@vegaprotocol/types';

export const generatePositionsMetrics = (
  override?: PartialDeep<PositionsMetrics>
): PositionsMetrics => {
  const nodes: PositionsMetrics_party_positionsConnection_edges_node[] = [
    {
      realisedPNL: '0',
      openVolume: '6',
      unrealisedPNL: '895000',
      averageEntryPrice: '1129935',
      updatedAt: '2022-07-28T15:09:34.441143Z',
      market: {
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        tradingMode: MarketTradingMode.Continuous,
        data: {
          markPrice: '17588787',
          __typename: 'MarketData',
        },
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          instrument: {
            name: 'UNIDAI Monthly (30 Jun 2022)',
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
    {
      realisedPNL: '0',
      openVolume: '1',
      unrealisedPNL: '-22519',
      averageEntryPrice: '84400088',
      updatedAt: '2022-07-28T14:53:54.725477Z',
      market: {
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        name: 'Tesla Quarterly (30 Jun 2022)',
        tradingMode: MarketTradingMode.Continuous,
        data: {
          markPrice: '84377569',
          __typename: 'MarketData',
        },
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          instrument: {
            name: 'Tesla Quarterly (30 Jun 2022)',
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      __typename: 'Position',
    },
  ];

  const defaultResult: PositionsMetrics = {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      accounts: [
        {
          __typename: 'Account',
          type: AccountType.General,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.Margin,
          balance: '1000',
          market: {
            __typename: 'Market',
            id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.Margin,
          balance: '1000',
          market: {
            __typename: 'Market',
            id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            decimals: 5,
          },
        },
      ],
      marginsConnection: {
        __typename: 'MarginConnection',
        edges: [
          {
            __typename: 'MarginEdge',
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
                symbol: 'tDAI',
              },
            },
          },
          {
            __typename: 'MarginEdge',
            node: {
              __typename: 'MarginLevels',
              maintenanceLevel: '0',
              searchLevel: '0',
              initialLevel: '0',
              collateralReleaseLevel: '0',
              market: {
                __typename: 'Market',
                id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376  ',
              },
              asset: {
                __typename: 'Asset',
                symbol: 'tEURO',
              },
            },
          },
        ],
      },
      positionsConnection: {
        __typename: 'PositionConnection',
        edges: nodes.map((node) => ({ __typename: 'PositionEdge', node })),
      },
      __typename: 'Party',
    },
  };

  return merge(defaultResult, override);
};
