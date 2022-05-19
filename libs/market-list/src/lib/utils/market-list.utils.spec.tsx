import type { MarketList } from '../components/__generated__/MarketList';
import { mapDataToMarketList } from './market-list.utils';

describe('mapDataToMarketList', () => {
  it('should map queried data to market list format', () => {
    const result = mapDataToMarketList(mockData.data as unknown as MarketList);
    const oldToNewMarketList = mockMarketList.reverse();
    expect(result).toEqual(oldToNewMarketList);
  });
});

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
      {
        __typename: 'Market',
        id: '3fb0491138b52f9d9c774a1e9b7de08c30b00e91333c89f29a86d50311ff0942',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'AAVEDAI Monthly (30 Jun 2022)',
            code: 'AAVEDAI.MF21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:43.905729908Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '8746102',
            close: '8618824',
          },
          {
            __typename: 'Candle',
            open: '8615295',
            close: '8540535',
          },
          {
            __typename: 'Candle',
            open: '8540536',
            close: '8289939',
          },
          {
            __typename: 'Candle',
            open: '8289939',
            close: '8404510',
          },
          {
            __typename: 'Candle',
            open: '8404510',
            close: '8378158',
          },
          {
            __typename: 'Candle',
            open: '8378158',
            close: '8401177',
          },
        ],
      },
      {
        __typename: 'Market',
        id: '41013c28d53a72225c07cf2660cdd415d9dd0e9317ec4574e77592332db35596',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'BTCUSD Monthly (30 Jun 2022)',
            code: 'BTCUSD.MF21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:33.286584976Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '2953908214',
            close: '2960548365',
          },
          {
            __typename: 'Candle',
            open: '2934043072',
            close: '2881010030',
          },
          {
            __typename: 'Candle',
            open: '2914084773',
            close: '2914084773',
          },
          {
            __typename: 'Candle',
            open: '2908102309',
            close: '2910586797',
          },
        ],
      },
      {
        __typename: 'Market',
        id: 'c68c3af7119f87a17c3225bbc33814a3d9163a71395a199b700fa5d742d90726',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'Tesla Quarterly (30 Jun 2022)',
            code: 'TSLA.QM21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:37.823394535Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '71169064',
            close: '71081587',
          },
          {
            __typename: 'Candle',
            open: '71436696',
            close: '71528140',
          },
          {
            __typename: 'Candle',
            open: '71542335',
            close: '69540196',
          },
          {
            __typename: 'Candle',
            open: '69446384',
            close: '68813735',
          },
          {
            __typename: 'Candle',
            open: '68482664',
            close: '67212656',
          },
          {
            __typename: 'Candle',
            open: '67046739',
            close: '67261057',
          },
        ],
      },
      {
        __typename: 'Market',
        id: 'cb2a28100fa0c1beae456a59229ab4721712a4ba4c4e6a427a61797606635b57',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'ETHBTC Quarterly (30 Jun 2022)',
            code: 'ETHBTC.QM21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:29.608264905Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '6791',
            close: '6803',
          },
          {
            __typename: 'Candle',
            open: '6803',
            close: '6805',
          },
          {
            __typename: 'Candle',
            open: '6805',
            close: '6784',
          },
          {
            __typename: 'Candle',
            open: '6784',
            close: '6852',
          },
          {
            __typename: 'Candle',
            open: '6854',
            close: '6810',
          },
          {
            __typename: 'Candle',
            open: '6810',
            close: '6776',
          },
        ],
      },
      {
        __typename: 'Market',
        id: 'e1318d8c1175b86eaf2d5d7462231ca172b58fe13d9c48b5c446efb14fd025ae',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'UNIDAI Monthly (30 Jun 2022)',
            code: 'UNIDAI.MF21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:38.627080545Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '510094',
            close: '501661',
          },
          {
            __typename: 'Candle',
            open: '501511',
            close: '498816',
          },
          {
            __typename: 'Candle',
            open: '498816',
            close: '491956',
          },
          {
            __typename: 'Candle',
            open: '491956',
            close: '499032',
          },
          {
            __typename: 'Candle',
            open: '495954',
            close: '495164',
          },
          {
            __typename: 'Candle',
            open: '496909',
            close: '495647',
          },
        ],
      },
    ],
  },
};

const mockMarketList = [
  {
    id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
    marketName: 'APEUSD',
    lastPrice: 7.74,
    candles: [
      { open: 8.22, close: 7.98 },
      { open: 7.93, close: 7.92 },
      { open: 7.94, close: 7.76 },
      { open: 7.85, close: 7.86 },
      { open: 8.03, close: 7.7 },
      { open: 7.85, close: 7.74 },
    ],
    changePercentage: -3.007518796992481,
    change: -0.2400000000000002,
    open: new Date('2022-05-18T13:08:27.693Z'),
    close: null,
  },
  {
    id: '3fb0491138b52f9d9c774a1e9b7de08c30b00e91333c89f29a86d50311ff0942',
    marketName: 'AAVEDAI.MF21',
    lastPrice: 84.01177,
    candles: [
      { open: 87.46102, close: 86.18824 },
      { open: 86.15295, close: 85.40535 },
      { open: 85.40536, close: 82.89939 },
      { open: 82.89939, close: 84.0451 },
      { open: 84.0451, close: 83.78158 },
      { open: 83.78158, close: 84.01177 },
    ],
    changePercentage: -2.5252517048729617,
    change: -2.176469999999995,
    open: new Date('2022-05-18T13:00:43.905Z'),
    close: null,
  },
  {
    id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
    marketName: 'AAPL.MF21',
    lastPrice: 141.74855,
    candles: [
      { open: 147.07175, close: 146.33864 },
      { open: 146.584, close: 145.50193 },
      { open: 145.50193, close: 143.73526 },
      { open: 143.07141, close: 143.39846 },
      { open: 143.57485, close: 141.79971 },
      { open: 141.79972, close: 141.74855 },
    ],
    changePercentage: -3.136622015894093,
    change: -4.590090000000004,
    open: new Date('2022-05-18T13:00:39.328Z'),
    close: null,
  },
  {
    id: 'e1318d8c1175b86eaf2d5d7462231ca172b58fe13d9c48b5c446efb14fd025ae',
    marketName: 'UNIDAI.MF21',
    lastPrice: 4.95647,
    candles: [
      { open: 5.10094, close: 5.01661 },
      { open: 5.01511, close: 4.98816 },
      { open: 4.98816, close: 4.91956 },
      { open: 4.91956, close: 4.99032 },
      { open: 4.95954, close: 4.95164 },
      { open: 4.96909, close: 4.95647 },
    ],
    changePercentage: -1.1988175281714146,
    change: -0.06013999999999964,
    open: new Date('2022-05-18T13:00:38.627Z'),
    close: null,
  },
  {
    id: 'c68c3af7119f87a17c3225bbc33814a3d9163a71395a199b700fa5d742d90726',
    marketName: 'TSLA.QM21',
    lastPrice: 672.61057,
    candles: [
      { open: 711.69064, close: 710.81587 },
      { open: 714.36696, close: 715.2814 },
      { open: 715.42335, close: 695.40196 },
      { open: 694.46384, close: 688.13735 },
      { open: 684.82664, close: 672.12656 },
      { open: 670.46739, close: 672.61057 },
    ],
    changePercentage: -5.374851858611429,
    change: -38.205299999999966,
    open: new Date('2022-05-18T13:00:37.823Z'),
    close: null,
  },
  {
    id: '41013c28d53a72225c07cf2660cdd415d9dd0e9317ec4574e77592332db35596',
    marketName: 'BTCUSD.MF21',
    lastPrice: 29105.86797,
    candles: [
      { open: 29539.08214, close: 29605.48365 },
      { open: 29340.43072, close: 28810.1003 },
      { open: 29140.84773, close: 29140.84773 },
      { open: 29081.02309, close: 29105.86797 },
    ],
    changePercentage: -1.6875781727011239,
    change: -499.615679999999,
    open: new Date('2022-05-18T13:00:33.286Z'),
    close: null,
  },
  {
    id: 'cb2a28100fa0c1beae456a59229ab4721712a4ba4c4e6a427a61797606635b57',
    marketName: 'ETHBTC.QM21',
    lastPrice: 0.06776,
    candles: [
      { open: 0.06791, close: 0.06803 },
      { open: 0.06803, close: 0.06805 },
      { open: 0.06805, close: 0.06784 },
      { open: 0.06784, close: 0.06852 },
      { open: 0.06854, close: 0.0681 },
      { open: 0.0681, close: 0.06776 },
    ],
    changePercentage: -0.3968837277671615,
    change: -0.00026999999999999247,
    open: new Date('2022-05-18T13:00:29.608Z'),
    close: null,
  },
];
