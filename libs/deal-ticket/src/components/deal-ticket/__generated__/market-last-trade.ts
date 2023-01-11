import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketLastTradeFieldsFragment = { __typename?: 'Market', depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } };

export type MarketLastTradeQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketLastTradeQuery = { __typename?: 'Query', market?: { __typename?: 'Market', depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } | null };

export const MarketLastTradeFieldsFragmentDoc = gql`
    fragment MarketLastTradeFields on Market {
  depth {
    lastTrade {
      price
    }
  }
}
    `;
export const MarketLastTradeDocument = gql`
    query MarketLastTrade($marketId: ID!) {
  market(id: $marketId) {
    ...MarketLastTradeFields
  }
}
    ${MarketLastTradeFieldsFragmentDoc}`;

/**
 * __useMarketLastTradeQuery__
 *
 * To run a query within a React component, call `useMarketLastTradeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketLastTradeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketLastTradeQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketLastTradeQuery(baseOptions: Apollo.QueryHookOptions<MarketLastTradeQuery, MarketLastTradeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketLastTradeQuery, MarketLastTradeQueryVariables>(MarketLastTradeDocument, options);
      }
export function useMarketLastTradeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketLastTradeQuery, MarketLastTradeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketLastTradeQuery, MarketLastTradeQueryVariables>(MarketLastTradeDocument, options);
        }
export type MarketLastTradeQueryHookResult = ReturnType<typeof useMarketLastTradeQuery>;
export type MarketLastTradeLazyQueryHookResult = ReturnType<typeof useMarketLastTradeLazyQuery>;
export type MarketLastTradeQueryResult = Apollo.QueryResult<MarketLastTradeQuery, MarketLastTradeQueryVariables>;