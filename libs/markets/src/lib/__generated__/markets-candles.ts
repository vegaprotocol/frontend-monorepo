import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { MarketCandlesFieldsFragmentDoc } from './market-candles';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketsCandlesQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketsCandlesQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } } | null> | null } | null } }> } | null };


export const MarketsCandlesDocument = gql`
    query MarketsCandles($interval: Interval!, $since: String!) {
  marketsConnection {
    edges {
      node {
        id
        candlesConnection(interval: $interval, since: $since, pagination: {last: 1000}) {
          edges {
            node {
              ...MarketCandlesFields
            }
          }
        }
      }
    }
  }
}
    ${MarketCandlesFieldsFragmentDoc}`;

/**
 * __useMarketsCandlesQuery__
 *
 * To run a query within a React component, call `useMarketsCandlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsCandlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsCandlesQuery({
 *   variables: {
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketsCandlesQuery(baseOptions: Apollo.QueryHookOptions<MarketsCandlesQuery, MarketsCandlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsCandlesQuery, MarketsCandlesQueryVariables>(MarketsCandlesDocument, options);
      }
export function useMarketsCandlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsCandlesQuery, MarketsCandlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsCandlesQuery, MarketsCandlesQueryVariables>(MarketsCandlesDocument, options);
        }
export type MarketsCandlesQueryHookResult = ReturnType<typeof useMarketsCandlesQuery>;
export type MarketsCandlesLazyQueryHookResult = ReturnType<typeof useMarketsCandlesLazyQuery>;
export type MarketsCandlesQueryResult = Apollo.QueryResult<MarketsCandlesQuery, MarketsCandlesQueryVariables>;