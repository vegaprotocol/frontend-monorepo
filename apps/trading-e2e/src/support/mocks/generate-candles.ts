import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  CandlesQuery,
  CandleFieldsFragment,
} from '@vegaprotocol/candles-chart';

export const generateCandles = (
  override?: PartialDeep<CandlesQuery>
): CandlesQuery => {
  const candles: CandleFieldsFragment[] = [
    {
      timestamp: '1661515200000000000',
      high: '17481092',
      low: '17403651',
      open: '17458833',
      close: '17446470',
      volume: '82721',
      __typename: 'Candle',
    },
    {
      timestamp: '1661516100000000000',
      high: '17491202',
      low: '17361138',
      open: '17446470',
      close: '17367174',
      volume: '62637',
      __typename: 'Candle',
    },
    {
      timestamp: '1661517000000000000',
      high: '17424522',
      low: '17337719',
      open: '17367174',
      close: '17376455',
      volume: '60259',
      __typename: 'Candle',
    },
  ];
  const defaultResult: CandlesQuery = {
    market: {
      id: 'market-0',
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
      candles,
      __typename: 'Market',
    },
  };
  return merge(defaultResult, override);
};
