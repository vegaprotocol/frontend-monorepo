import * as Schema from '@vegaprotocol/types';
import type { Market, MarketMaybeWithDataAndCandles } from './markets-provider';
import {
  calcTradedFactor,
  filterAndSortMarkets,
  totalFeesPercentage,
} from './market-utils';
const { MarketState, MarketTradingMode } = Schema;

const MARKET_A: Partial<Market> = {
  id: '1',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-18T13:08:27.693537312Z',
    close: null,
  },
  state: MarketState.STATE_ACTIVE,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_B: Partial<Market> = {
  id: '2',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-18T13:00:39.328347732Z',
    close: null,
  },
  state: MarketState.STATE_ACTIVE,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_C: Partial<Market> = {
  id: '3',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-17T13:00:39.328347732Z',
    close: null,
  },
  state: MarketState.STATE_REJECTED,
  tradingMode: MarketTradingMode.TRADING_MODE_CONTINUOUS,
};

const MARKET_D: Partial<Market> = {
  id: '4',
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2022-05-16T13:00:39.328347732Z',
    close: null,
  },
  state: MarketState.STATE_ACTIVE,
  tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
};

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = filterAndSortMarkets([
      MARKET_A,
      MARKET_B,
      MARKET_C,
      MARKET_D,
    ] as unknown as Market[]);
    expect(result).toEqual([MARKET_B, MARKET_A]);
  });
});

describe('totalFees', () => {
  const createFee = (...f: number[]): Market['fees']['factors'] => ({
    __typename: 'FeeFactors',
    infrastructureFee: f[0].toString(),
    liquidityFee: f[1].toString(),
    makerFee: f[2].toString(),
  });
  it.each([
    { i: createFee(0, 0, 1), o: '100.00%' },
    { i: createFee(0, 1, 0), o: '100.00%' },
    { i: createFee(1, 0, 0), o: '100.00%' },
    { i: createFee(0.01, 0.02, 0.003), o: '3.30%' },
    { i: createFee(0.01, 0.056782, 0.003), o: '6.9782%' },
    { i: createFee(0.01, 0.056782, 0), o: '6.6782%' },
  ])('adds fees correctly', ({ i, o }) => {
    expect(totalFeesPercentage(i)).toEqual(o);
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
