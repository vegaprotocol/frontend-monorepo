import * as Schema from '@vegaprotocol/types';
import type {
  Market,
  MarketMaybeWithData,
  MarketMaybeWithDataAndCandles,
} from './markets-provider';
import {
  calcCandleVolumePrice,
  calcTradedFactor,
  filterAndSortMarkets,
  sumFeesFactors,
  totalFeesFactorsPercentage,
} from './market-utils';
import type { MarketData } from './market-data-provider';
const { MarketState, MarketTradingMode } = Schema;

const MARKET_A: Partial<MarketMaybeWithData> = {
  id: '1',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    proposed: '2022-05-11T13:08:27.693537312Z',
    pending: '2022-05-12T13:08:27.693537312Z',
    open: '2022-05-18T13:08:27.693537312Z',
    close: null,
  },
  data: {
    marketState: MarketState.STATE_ACTIVE,
    marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  } as MarketData,
};

const MARKET_B: Partial<MarketMaybeWithData> = {
  id: '2',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    proposed: '2022-05-11T13:08:27.693537312Z',
    pending: '2022-05-12T13:08:27.693537312Z',
    open: '2022-05-18T13:00:39.328347732Z',
    close: null,
  },
  data: {
    marketState: MarketState.STATE_ACTIVE,
    marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  } as MarketData,
};

const MARKET_C: Partial<MarketMaybeWithData> = {
  id: '3',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    proposed: '2022-05-11T13:08:27.693537312Z',
    pending: '2022-05-12T13:08:27.693537312Z',
    open: '2022-05-17T13:00:39.328347732Z',
    close: null,
  },
  data: {
    marketState: MarketState.STATE_REJECTED,
    marketTradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
  } as MarketData,
};

const MARKET_D: Partial<MarketMaybeWithData> = {
  id: '4',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    proposed: '2022-05-11T13:08:27.693537312Z',
    pending: '2022-05-12T13:08:27.693537312Z',
    open: '2022-05-16T13:00:39.328347732Z',
    close: null,
  },
  data: {
    marketState: MarketState.STATE_ACTIVE,
    marketTradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
  } as MarketData,
};

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = filterAndSortMarkets([
      MARKET_A,
      MARKET_B,
      MARKET_C,
      MARKET_D,
    ] as unknown as MarketMaybeWithData[]);
    expect(result).toEqual([MARKET_B, MARKET_A]);
  });
});

describe('totalFeesFactorsPercentage', () => {
  const createFee = (...f: number[]): Market['fees']['factors'] => ({
    __typename: 'FeeFactors',
    infrastructureFee: f[0].toString(),
    liquidityFee: f[1].toString(),
    makerFee: f[2].toString(),
    treasuryFee: f[3].toString(),
    buyBackFee: f[4].toString(),
  });
  it.each([
    { i: createFee(0, 0, 1, 0, 0), o: '100%' },
    { i: createFee(0, 1, 0, 0, 0), o: '100%' },
    { i: createFee(1, 0, 0, 0, 0), o: '100%' },
    { i: createFee(0.01, 0.02, 0.003, 0.01, 0.02), o: '6.3%' },
    { i: createFee(0.01, 0.056782, 0.003, 0.01, 0.001), o: '8.0782%' },
    { i: createFee(0.01, 0.056782, 0, 0.0001, 0.0001), o: '6.6982%' },
  ])('adds fees correctly', ({ i, o }) => {
    expect(totalFeesFactorsPercentage(i)).toEqual(o);
  });
});

describe('calcTradedFactor', () => {
  const marketA = {
    data: {
      markPrice: '10',
    },
    candles: [
      {
        volume: '1000',
      },
    ],
    tradableInstrument: {
      instrument: {
        product: {
          __typename: 'Future',
          settlementAsset: {
            decimals: 18,
            quantum: '1000000000000000000', // 1
          },
        },
      },
    },
  };
  const marketB = {
    data: {
      markPrice: '10',
    },
    candles: [
      {
        volume: '1000',
      },
    ],
    tradableInstrument: {
      instrument: {
        product: {
          __typename: 'Future',
          settlementAsset: {
            decimals: 18,
            quantum: '1', // 0.0000000000000000001
          },
        },
      },
    },
  };
  it('a is "traded" more than b', () => {
    const fa = calcTradedFactor(marketA as MarketMaybeWithDataAndCandles);
    const fb = calcTradedFactor(marketB as MarketMaybeWithDataAndCandles);
    // it should be true because market a's asset is "more valuable" than b's
    expect(fa > fb).toBeTruthy();
  });
});

describe('sumFeesFactors', () => {
  it('does not result in flop errors', () => {
    expect(
      sumFeesFactors({
        makerFee: '0.1',
        infrastructureFee: '0.2',
        liquidityFee: '0.3',
        buyBackFee: '0.1',
        treasuryFee: '0.1',
      })
    ).toEqual(0.8);
  });
});

describe('calcCandleVolumePrice', () => {
  it('calculates the volume price', () => {
    const candles = [
      {
        volume: '1000',
        high: '100',
        low: '10',
        open: '15',
        close: '90',
        notional: '100',
        periodStart: '2022-05-18T13:08:27.693537312Z',
      },
      {
        volume: '1000',
        high: '100',
        low: '10',
        open: '15',
        close: '90',
        notional: '100',
        periodStart: '2022-05-18T14:08:27.693537312Z',
      },
    ];

    const marketDecimals = 3;
    const positionDecimalPlaces = 2;
    expect(
      calcCandleVolumePrice(candles, marketDecimals, positionDecimalPlaces)
    ).toEqual('0.002');
  });
});
