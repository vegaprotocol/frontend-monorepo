import { AccountType, MarketTradingMode } from '@vegaprotocol/types';
import type { PositionsMetrics } from './__generated__/PositionsMetrics';
import { getMetrics } from './positions-metrics-data-provider';

const data: PositionsMetrics = {
  party: {
    __typename: 'Party',
    id: '02eceaba4df2bef76ea10caf728d8a099a2aa846cced25737cccaa9812342f65',
    accounts: [
      {
        __typename: 'Account',
        type: AccountType.General,
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          decimals: 5,
        },
        balance: '892824769',
        market: null,
      },
      {
        __typename: 'Account',
        type: AccountType.Margin,
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          decimals: 5,
        },
        balance: '33353727',
        market: {
          __typename: 'Market',
          id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
        },
      },
      {
        __typename: 'Account',
        type: AccountType.Margin,
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          decimals: 5,
        },
        balance: '3274050',
        market: {
          __typename: 'Market',
          id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
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
              id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
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
              id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
            },
            asset: {
              __typename: 'Asset',
              symbol: 'tDAI',
            },
          },
        },
      ],
    },
    positionsConnection: {
      __typename: 'PositionConnection',
      edges: [
        {
          __typename: 'PositionEdge',
          node: {
            __typename: 'Position',
            openVolume: '100',
            averageEntryPrice: '8993727',
            updatedAt: '2022-07-28T14:53:54.725477Z',
            realisedPNL: '0',
            unrealisedPNL: '43804770',
            market: {
              __typename: 'Market',
              name: 'AAVEDAI Monthly (30 Jun 2022)',
              id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
              decimalPlaces: 5,
              tradingMode: MarketTradingMode.MonitoringAuction,
              positionDecimalPlaces: 0,
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'AAVEDAI Monthly (30 Jun 2022)',
                },
              },
              data: {
                __typename: 'MarketData',
                markPrice: '9431775',
              },
            },
          },
        },
        {
          __typename: 'PositionEdge',
          node: {
            __typename: 'Position',
            openVolume: '-100',
            realisedPNL: '0',
            unrealisedPNL: '-9112700',
            averageEntryPrice: '840158',
            updatedAt: '2022-07-28T15:09:34.441143Z',
            market: {
              __typename: 'Market',
              id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
              name: 'UNIDAI Monthly (30 Jun 2022)',
              decimalPlaces: 5,
              tradingMode: MarketTradingMode.Continuous,
              positionDecimalPlaces: 0,
              tradableInstrument: {
                __typename: 'TradableInstrument',
                instrument: {
                  __typename: 'Instrument',
                  name: 'UNIDAI Monthly (30 Jun 2022)',
                },
              },
              data: {
                __typename: 'MarketData',
                markPrice: '869762',
              },
            },
          },
        },
      ],
    },
  },
};

describe('getMetrics', () => {
  it('should return positions metrics', () => {
    const metrics = getMetrics(data.party);
    expect(metrics.length).toEqual(2);
  });
});
