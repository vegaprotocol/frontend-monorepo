import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

// TODO: Figure out how to get types
// eslint-disable-next-line
type Candles = any;

export const generateCandles = (override?: PartialDeep<Candles>): Candles => {
  const defaultResult = {
    market: {
      id: 'market-id',
      decimalPlaces: 5,
      tradableInstrument: {
        instrument: {
          id: '',
          name: 'Apple Monthly (30 Jun 2022)',
          code: 'AAPL.MF21',
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      candles: [
        {
          datetime: '2022-04-06T09:15:00Z',
          high: '17481092',
          low: '17403651',
          open: '17458833',
          close: '17446470',
          volume: '82721',
          __typename: 'Candle',
        },
        {
          datetime: '2022-04-06T09:30:00Z',
          high: '17491202',
          low: '17361138',
          open: '17446470',
          close: '17367174',
          volume: '62637',
          __typename: 'Candle',
        },
        {
          datetime: '2022-04-06T09:45:00Z',
          high: '17424522',
          low: '17337719',
          open: '17367174',
          close: '17376455',
          volume: '60259',
          __typename: 'Candle',
        },
      ],
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};
