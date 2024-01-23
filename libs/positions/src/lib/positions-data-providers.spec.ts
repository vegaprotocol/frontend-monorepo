import * as Schema from '@vegaprotocol/types';
import type { Account } from '@vegaprotocol/accounts';
import type { MarketWithData } from '@vegaprotocol/markets';
import type { PositionFieldsFragment } from './__generated__/Positions';
import type { Position } from './positions-data-providers';
import {
  getMetrics,
  preparePositions,
  rejoinPositionData,
} from './positions-data-providers';
import { PositionStatus } from '@vegaprotocol/types';

const accounts = [
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    asset: {
      __typename: 'Asset',
      symbol: 'tDAI',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      decimals: 5,
    },
    balance: '892824769',
    market: null,
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    asset: {
      __typename: 'Asset',
      symbol: 'tDAI',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      decimals: 5,
    },
    balance: '33353727',
    market: {
      __typename: 'Market',
      id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'AAVEDAI Monthly (30 Jun 2022)',
        },
      },
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    asset: {
      __typename: 'Asset',
      symbol: 'tDAI',
      id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
      decimals: 5,
    },
    balance: '3274050',
    market: {
      __typename: 'Market',
      id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          name: 'UNIDAI Monthly (30 Jun 2022)',
        },
      },
    },
  },
] as Account[];

const positions: PositionFieldsFragment[] = [
  {
    __typename: 'Position',
    openVolume: '100',
    averageEntryPrice: '8993727',
    updatedAt: '2022-07-28T14:53:54.725477Z',
    realisedPNL: '0',
    unrealisedPNL: '43804770',
    market: {
      __typename: 'Market',
      id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
    },
    party: {
      id: 'partyId',
    },
    lossSocializationAmount: '0',
    positionStatus: PositionStatus.POSITION_STATUS_UNSPECIFIED,
  },
  {
    __typename: 'Position',
    openVolume: '-100',
    realisedPNL: '0',
    unrealisedPNL: '-9112700',
    averageEntryPrice: '840158',
    updatedAt: '2022-07-28T15:09:34.441143Z',
    market: {
      __typename: 'Market',
      id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
    },
    party: {
      id: 'partyId',
    },
    lossSocializationAmount: '100',
    positionStatus: PositionStatus.POSITION_STATUS_ORDERS_CLOSED,
  },
];

const marketsData = [
  {
    __typename: 'Market',
    id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
    decimalPlaces: 5,
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    positionDecimalPlaces: 0,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        name: 'AAVEDAI Monthly (30 Jun 2022)',
        code: 'AAVEDAI.MF21',
        product: {
          __typename: 'Future',
          settlementAsset: {
            symbol: 'tDAI',
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            decimals: 5,
          },
        },
      },
    },
    data: {
      __typename: 'MarketData',
      markPrice: '9431775',
      market: {
        __typename: 'Market',
        id: '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8',
      },
    },
  },
  {
    __typename: 'Market',
    id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
    decimalPlaces: 5,
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    positionDecimalPlaces: 0,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        code: 'UNIDAI.MF21',
        product: {
          __typename: 'Future',
          settlementAsset: {
            symbol: 'tDAI',
            id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
            decimals: 5,
          },
        },
      },
    },
    data: {
      __typename: 'MarketData',
      markPrice: '869762',
      market: {
        __typename: 'Market',
        id: '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e',
      },
    },
  },
] as MarketWithData[];

describe('getMetrics && rejoinPositionData', () => {
  it('returns positions metrics', () => {
    const positionsRejoined = rejoinPositionData(positions, marketsData);
    const metrics = getMetrics(positionsRejoined, accounts || null);
    expect(metrics.length).toEqual(2);
  });

  it('calculates metrics', () => {
    const positionsRejoined = rejoinPositionData(positions, marketsData);
    const metrics = getMetrics(positionsRejoined, accounts || null);

    expect(metrics[0].assetSymbol).toEqual('tDAI');
    expect(metrics[0].averageEntryPrice).toEqual('8993727');
    expect(metrics[0].currentLeverage).toBeCloseTo(1.02);
    expect(metrics[0].marketDecimalPlaces).toEqual(5);
    expect(metrics[0].positionDecimalPlaces).toEqual(0);
    expect(metrics[0].assetDecimals).toEqual(5);
    expect(metrics[0].markPrice).toEqual('9431775');
    expect(metrics[0].marketId).toEqual(
      '5e6035fe6a6df78c9ec44b333c231e63d357acef0a0620d2c243f5865d1dc0d8'
    );
    expect(metrics[0].marketCode).toEqual('AAVEDAI.MF21');
    expect(metrics[0].marketTradingMode).toEqual(
      'TRADING_MODE_MONITORING_AUCTION'
    );
    expect(metrics[0].notional).toEqual('943177500');
    expect(metrics[0].openVolume).toEqual('100');
    expect(metrics[0].realisedPNL).toEqual('0');
    expect(metrics[0].totalBalance).toEqual('926178496');
    expect(metrics[0].unrealisedPNL).toEqual('43804770');
    expect(metrics[0].updatedAt).toEqual('2022-07-28T14:53:54.725477Z');
    expect(metrics[0].lossSocializationAmount).toEqual(
      positions[0].lossSocializationAmount
    );
    expect(metrics[0].status).toEqual(positions[0].positionStatus);

    expect(metrics[1].assetSymbol).toEqual('tDAI');
    expect(metrics[1].averageEntryPrice).toEqual('840158');
    expect(metrics[1].currentLeverage).toBeCloseTo(0.097);
    expect(metrics[1].marketDecimalPlaces).toEqual(5);
    expect(metrics[1].positionDecimalPlaces).toEqual(0);
    expect(metrics[1].assetDecimals).toEqual(5);
    expect(metrics[1].markPrice).toEqual('869762');
    expect(metrics[1].marketId).toEqual(
      '10c4b1114d2f6fda239b73d018bca55888b6018f0ac70029972a17fea0a6a56e'
    );
    expect(metrics[1].marketCode).toEqual('UNIDAI.MF21');
    expect(metrics[1].marketTradingMode).toEqual('TRADING_MODE_CONTINUOUS');
    expect(metrics[1].notional).toEqual('86976200');
    expect(metrics[1].openVolume).toEqual('-100');
    expect(metrics[1].realisedPNL).toEqual('0');
    expect(metrics[1].totalBalance).toEqual('896098819');
    expect(metrics[1].unrealisedPNL).toEqual('-9112700');
    expect(metrics[1].updatedAt).toEqual('2022-07-28T15:09:34.441143Z');
    expect(metrics[1].lossSocializationAmount).toEqual(
      positions[1].lossSocializationAmount
    );
    expect(metrics[1].status).toEqual(positions[1].positionStatus);
  });

  it('sorts and filters positions', () => {
    const createPosition = (override?: Partial<Position>) =>
      ({
        marketState: Schema.MarketState.STATE_ACTIVE,
        marketCode: 'a',
        ...override,
      } as Position);

    const data = [
      createPosition(),
      createPosition({
        marketCode: 'c',
        marketState: Schema.MarketState.STATE_CANCELLED,
      }),
      createPosition({ marketCode: 'd' }),
      createPosition({ marketCode: 'b' }),
    ];

    const withoutClosed = preparePositions(data, false);
    expect(withoutClosed.map((p) => p.marketCode)).toEqual(['a', 'b', 'd']);

    const withClosed = preparePositions(data, true);
    expect(withClosed.map((p) => p.marketCode)).toEqual(['a', 'b', 'c', 'd']);
  });
});
