import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketMarkPriceQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketMarkPriceQuery = { __typename?: 'Query', market?: { __typename?: 'Market', decimalPlaces: number, data?: { __typename?: 'MarketData', markPrice: string } | null } | null };


export const MarketMarkPriceDocument = gql`
    query MarketMarkPrice($marketId: ID!) {
  market(id: $marketId) {
    decimalPlaces
    data {
      markPrice
    }
  }
}
    `;

/**
 * __useMarketMarkPriceQuery__
 *
 * To run a query within a React component, call `useMarketMarkPriceQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketMarkPriceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketMarkPriceQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketMarkPriceQuery(baseOptions: Apollo.QueryHookOptions<MarketMarkPriceQuery, MarketMarkPriceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketMarkPriceQuery, MarketMarkPriceQueryVariables>(MarketMarkPriceDocument, options);
      }
export function useMarketMarkPriceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketMarkPriceQuery, MarketMarkPriceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketMarkPriceQuery, MarketMarkPriceQueryVariables>(MarketMarkPriceDocument, options);
        }
export type MarketMarkPriceQueryHookResult = ReturnType<typeof useMarketMarkPriceQuery>;
export type MarketMarkPriceLazyQueryHookResult = ReturnType<typeof useMarketMarkPriceLazyQuery>;
export type MarketMarkPriceQueryResult = Apollo.QueryResult<MarketMarkPriceQuery, MarketMarkPriceQueryVariables>;