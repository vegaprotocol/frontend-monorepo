import type { MarketList } from '../__generated__/MarketList';
import { mapDataToMarketList } from './market-list.utils';

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = mapDataToMarketList(mockData.data as unknown as MarketList);
    expect(result).toEqual(mockList);
  });
});

const mockList = [
  {
    __typename: 'Market',
    candles: [
      { __typename: 'Candle', close: '14633864', open: '14707175' },
      { __typename: 'Candle', close: '14550193', open: '14658400' },
      { __typename: 'Candle', close: '14373526', open: '14550193' },
      { __typename: 'Candle', close: '14339846', open: '14307141' },
      { __typename: 'Candle', close: '14179971', open: '14357485' },
      { __typename: 'Candle', close: '14174855', open: '14179972' },
    ],
    close: null,
    decimalPlaces: 5,
    id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
    lastPrice: '14174855',
    marketName: 'AAPL.MF21',
    open: 1652878839328,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'AAPL.MF21',
        name: 'Apple Monthly (30 Jun 2022)',
      },
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      close: null,
      open: '2022-05-18T13:00:39.328347732Z',
    },
  },
  {
    __typename: 'Market',
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      close: null,
      open: '2022-05-18T13:08:27.693537312Z',
    },
    candles: [
      { __typename: 'Candle', close: '798', open: '822' },
      { __typename: 'Candle', close: '792', open: '793' },
      { __typename: 'Candle', close: '776', open: '794' },
      { __typename: 'Candle', close: '786', open: '785' },
      { __typename: 'Candle', close: '770', open: '803' },
      { __typename: 'Candle', close: '774', open: '785' },
    ],
    close: null,
    decimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'APEUSD',
        name: 'APEUSD (May 2022)',
      },
    },
    id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
    lastPrice: '774',
    marketName: 'APEUSD',
    open: 1652879307693,
  },
];

const mockData = {
  data: {
    markets: [
      {
        __typename: 'Market',
        id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
        decimalPlaces: 2,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'APEUSD (May 2022)',
            code: 'APEUSD',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:08:27.693537312Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '822',
            close: '798',
          },
          {
            __typename: 'Candle',
            open: '793',
            close: '792',
          },
          {
            __typename: 'Candle',
            open: '794',
            close: '776',
          },
          {
            __typename: 'Candle',
            open: '785',
            close: '786',
          },
          {
            __typename: 'Candle',
            open: '803',
            close: '770',
          },
          {
            __typename: 'Candle',
            open: '785',
            close: '774',
          },
        ],
      },
      {
        __typename: 'Market',
        id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'Apple Monthly (30 Jun 2022)',
            code: 'AAPL.MF21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:39.328347732Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '14707175',
            close: '14633864',
          },
          {
            __typename: 'Candle',
            open: '14658400',
            close: '14550193',
          },
          {
            __typename: 'Candle',
            open: '14550193',
            close: '14373526',
          },
          {
            __typename: 'Candle',
            open: '14307141',
            close: '14339846',
          },
          {
            __typename: 'Candle',
            open: '14357485',
            close: '14179971',
          },
          {
            __typename: 'Candle',
            open: '14179972',
            close: '14174855',
          },
        ],
      },
    ],
  },
};
