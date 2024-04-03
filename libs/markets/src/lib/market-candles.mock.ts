import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  MarketCandlesQuery,
  MarketCandlesFieldsFragment,
} from './__generated__/market-candles';

export const marketCandlesQuery = (
  override?: PartialDeep<MarketCandlesQuery>
): MarketCandlesQuery => {
  const defaultResult: MarketCandlesQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: [
        {
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: marketCandlesFieldsFragment,
                },
              ],
            },
          },
        },
      ],
    },
  };
  return merge(defaultResult, override);
};

const marketCandlesFieldsFragment: MarketCandlesFieldsFragment = {
  __typename: 'Candle',
  open: '100',
  close: '100',
  high: '110',
  low: '90',
  volume: '1',
  notional: '100',
  periodStart: '2022-11-01T15:49:00Z',
};
