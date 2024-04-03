import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketCandlesFieldsFragment } from './__generated__/market-candles';
import type { MarketsCandlesQuery } from './__generated__/markets-candles';

export const marketsCandlesQuery = (
  override?: PartialDeep<MarketsCandlesQuery>
): MarketsCandlesQuery => {
  const defaultResult: MarketsCandlesQuery = {
    marketsConnection: {
      __typename: 'MarketConnection',
      edges: ['market-0', 'market-1', 'market-2', 'market-3'].map(
        (marketId) => ({
          __typename: 'MarketEdge',
          node: {
            __typename: 'Market',
            id: marketId,
            candlesConnection: {
              __typename: 'CandleDataConnection',
              edges: [
                {
                  __typename: 'CandleEdge',
                  node: createCandle({ close: '100' }),
                },
                {
                  __typename: 'CandleEdge',
                  node: createCandle({ close: '200' }),
                },
                {
                  __typename: 'CandleEdge',
                  node: createCandle({ close: '300' }),
                },
              ],
            },
          },
        })
      ),
    },
  };
  return merge(defaultResult, override);
};

const createCandle = (
  override?: Partial<MarketCandlesFieldsFragment>
): MarketCandlesFieldsFragment => {
  const defaultCandle = {
    __typename: 'Candle',
    open: '100',
    close: '100',
    high: '110',
    low: '90',
    volume: '1',
    notional: '100',
    periodStart: '2022-11-01T15:49:00Z',
  };
  return merge(defaultCandle, override);
};
