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
  it('returns positions metrics', () => {
    const metrics = getMetrics(data.party);
    expect(metrics.length).toEqual(2);
  });

  it('calculates metrics', () => {
    const metrics = getMetrics(data.party);

    expect(metrics[0].assetSymbol).toEqual('tDAI');
    expect(metrics[0].averageEntryPrice).toEqual('8993727');
    expect(metrics[0].capitalUtilisation).toEqual('4');
    expect(metrics[0].currentLeverage).toBeCloseTo(1.02);
    expect(metrics[0].marketDecimalPlaces).toEqual(5);
    expect(metrics[0].positionDecimalPlaces).toEqual(0);
    expect(metrics[0].assetDecimals).toEqual(5);
    expect(metrics[0].liquidationPrice).toEqual('169990');
    expect(metrics[0].lowMarginLevel).toEqual(false);
    expect(metrics[0].markPrice).toEqual('9431775');
    expect(metrics[0].marketId).toEqual(
      '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8'
    );
    expect(metrics[0].marketName).toEqual('AAVEDAI Monthly (30 Jun 2022)');
    expect(metrics[0].marketTradingMode).toEqual('MonitoringAuction');
    expect(metrics[0].notional).toEqual('943177500');
    expect(metrics[0].openVolume).toEqual('100');
    expect(metrics[0].realisedPNL).toEqual('0');
    expect(metrics[0].searchPrice).toEqual('9098238');
    expect(metrics[0].totalBalance).toEqual('926178496');
    expect(metrics[0].unrealisedPNL).toEqual('43804770');
    expect(metrics[0].updatedAt).toEqual('2022-07-28T14:53:54.725477Z');

    expect(metrics[1].assetSymbol).toEqual('tDAI');
    expect(metrics[1].averageEntryPrice).toEqual('840158');
    expect(metrics[1].capitalUtilisation).toEqual('0');
    expect(metrics[1].currentLeverage).toBeCloseTo(0.097);
    expect(metrics[1].marketDecimalPlaces).toEqual(5);
    expect(metrics[1].positionDecimalPlaces).toEqual(0);
    expect(metrics[1].assetDecimals).toEqual(5);
    expect(metrics[1].liquidationPrice).toEqual('9830750');
    expect(metrics[1].lowMarginLevel).toEqual(false);
    expect(metrics[1].markPrice).toEqual('869762');
    expect(metrics[1].marketId).toEqual(
      '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e'
    );
    expect(metrics[1].marketName).toEqual('UNIDAI Monthly (30 Jun 2022)');
    expect(metrics[1].marketTradingMode).toEqual('Continuous');
    expect(metrics[1].notional).toEqual('86976200');
    expect(metrics[1].openVolume).toEqual('-100');
    expect(metrics[1].realisedPNL).toEqual('0');
    expect(metrics[1].searchPrice).toEqual('902503');
    expect(metrics[1].totalBalance).toEqual('896098819');
    expect(metrics[1].unrealisedPNL).toEqual('-9112700');
    expect(metrics[1].updatedAt).toEqual('2022-07-28T15:09:34.441143Z');
  });
});
