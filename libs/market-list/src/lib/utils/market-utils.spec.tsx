import type { MarketList } from '../__generated__/MarketList';
import { mapDataToMarketList } from './market-utils';

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = mapDataToMarketList(mockData.data as unknown as MarketList);
    expect(result).toEqual(mockList);
  });
});

const mockList = [
  {
    __typename: 'Market',
    id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
    decimalPlaces: 5,
    candles: [
      {
        open: '16141155',
        close: '16293551',
        high: '16320190',
        low: '16023805',
        __typename: 'Candle',
      },
      {
        open: '16293548',
        close: '16322118',
        high: '16365861',
        low: '16192970',
        __typename: 'Candle',
      },
    ],
    fees: {
      factors: {
        makerFee: 0.0002,
        infrastructureFee: 0.0005,
        liquidityFee: 0.001,
      },
    },
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        name: 'Apple Monthly (30 Jun 2022)',
        code: 'AAPL.MF21',
        product: {
          settlementAsset: { symbol: 'AAPL.MF21', __typename: 'Asset' },
          __typename: 'Future',
        },
      },
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      open: '2022-05-18T13:00:39.328347732Z',
      close: null,
    },
    marketName: 'AAPL.MF21',
    settlementAsset: 'AAPL.MF21',
    lastPrice: '16322118',
    candleHigh: '16365861',
    candleLow: '16023805',
    open: 1652878839328,
    close: null,
    totalFees: '0.14%',
  },
  {
    __typename: 'Market',
    id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
    decimalPlaces: 2,
    fees: {
      factors: {
        makerFee: 0.0002,
        infrastructureFee: 0.0005,
        liquidityFee: 0.001,
      },
    },
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        name: 'APEUSD (May 2022)',
        code: 'APEUSD',
        product: {
          settlementAsset: { symbol: 'APEUSD', __typename: 'Asset' },
          __typename: 'Future',
        },
      },
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      open: '2022-05-18T13:08:27.693537312Z',
      close: null,
    },
    candles: [
      {
        open: '16141155',
        close: '16293551',
        high: '16320190',
        low: '16023805',
        __typename: 'Candle',
      },
      {
        open: '16293548',
        close: '16322118',
        high: '16365861',
        low: '16192970',
        __typename: 'Candle',
      },
    ],
    marketName: 'APEUSD',
    settlementAsset: 'APEUSD',
    lastPrice: '16322118',
    candleHigh: '16365861',
    candleLow: '16023805',
    open: 1652879307693,
    close: null,
    totalFees: '0.14%',
  },
];

const mockData = {
  data: {
    markets: [
      {
        __typename: 'Market',
        id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
        decimalPlaces: 2,
        fees: {
          factors: {
            makerFee: 0.0002,
            infrastructureFee: 0.0005,
            liquidityFee: 0.001,
          },
        },
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'APEUSD (May 2022)',
            code: 'APEUSD',
            product: {
              settlementAsset: {
                symbol: 'APEUSD',
                __typename: 'Asset',
              },
              __typename: 'Future',
            },
          },
        },

        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:08:27.693537312Z',
          close: null,
        },
        candles: [
          {
            open: '16141155',
            close: '16293551',
            high: '16320190',
            low: '16023805',
            __typename: 'Candle',
          },
          {
            open: '16293548',
            close: '16322118',
            high: '16365861',
            low: '16192970',
            __typename: 'Candle',
          },
        ],
      },
      {
        __typename: 'Market',
        id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
        decimalPlaces: 5,
        candles: [
          {
            open: '16141155',
            close: '16293551',
            high: '16320190',
            low: '16023805',
            __typename: 'Candle',
          },
          {
            open: '16293548',
            close: '16322118',
            high: '16365861',
            low: '16192970',
            __typename: 'Candle',
          },
        ],
        fees: {
          factors: {
            makerFee: 0.0002,
            infrastructureFee: 0.0005,
            liquidityFee: 0.001,
          },
        },
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'Apple Monthly (30 Jun 2022)',
            code: 'AAPL.MF21',
            product: {
              settlementAsset: {
                symbol: 'AAPL.MF21',
                __typename: 'Asset',
              },
              __typename: 'Future',
            },
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:39.328347732Z',
          close: null,
        },
      },
    ],
  },
};
