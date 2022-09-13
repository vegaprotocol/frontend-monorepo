import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TradesQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type TradesQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, tradesConnection?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | null };

export type TradesSubSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type TradesSubSubscription = { __typename?: 'Subscription', trades?: Array<{ __typename?: 'TradeUpdate', id: string, price: string, size: string, createdAt: string, marketId: string }> | null };


export const TradesDocument = gql`
    query Trades($marketId: ID!, $pagination: Pagination) {
  market(id: $marketId) {
    id
    tradesConnection(pagination: $pagination) {
      edges {
        node {
          id
          price
          size
          createdAt
          market {
            id
            decimalPlaces
            positionDecimalPlaces
          }
        }
        cursor
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
}
    `;

/**
 * __useTradesQuery__
 *
 * To run a query within a React component, call `useTradesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTradesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTradesQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useTradesQuery(baseOptions: Apollo.QueryHookOptions<TradesQuery, TradesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TradesQuery, TradesQueryVariables>(TradesDocument, options);
      }
export function useTradesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TradesQuery, TradesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TradesQuery, TradesQueryVariables>(TradesDocument, options);
        }
export type TradesQueryHookResult = ReturnType<typeof useTradesQuery>;
export type TradesLazyQueryHookResult = ReturnType<typeof useTradesLazyQuery>;
export type TradesQueryResult = Apollo.QueryResult<TradesQuery, TradesQueryVariables>;
export const TradesSubDocument = gql`
    subscription TradesSub($marketId: ID!) {
  trades(marketId: $marketId) {
    id
    price
    size
    createdAt
    marketId
  }
}
    `;

/**
 * __useTradesSubSubscription__
 *
 * To run a query within a React component, call `useTradesSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTradesSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTradesSubSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useTradesSubSubscription(baseOptions: Apollo.SubscriptionHookOptions<TradesSubSubscription, TradesSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TradesSubSubscription, TradesSubSubscriptionVariables>(TradesSubDocument, options);
      }
export type TradesSubSubscriptionHookResult = ReturnType<typeof useTradesSubSubscription>;
export type TradesSubSubscriptionResult = Apollo.SubscriptionResult<TradesSubSubscription>;