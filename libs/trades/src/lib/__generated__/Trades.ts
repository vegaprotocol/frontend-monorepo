import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TradeFieldsFragment = { __typename?: 'Trade', id: string, price: string, size: string, createdAt: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number } };

export type TradeEdgeFieldsFragment = { __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number } } };

export type TradesQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type TradesQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, tradesConnection: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } } | null };

export type TradesEventSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type TradesEventSubscription = { __typename?: 'Subscription', trades?: Array<{ __typename?: 'Trade', id: string, price: string, size: string, createdAt: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number } }> | null };

export const TradeFieldsFragmentDoc = gql`
    fragment TradeFields on Trade {
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
    `;
export const TradeEdgeFieldsFragmentDoc = gql`
    fragment TradeEdgeFields on TradeEdge {
  node {
    ...TradeFields
  }
  cursor
}
    ${TradeFieldsFragmentDoc}`;
export const TradesDocument = gql`
    query Trades($marketId: ID!, $pagination: Pagination) {
  market(id: $marketId) {
    id
    tradesConnection(pagination: $pagination) {
      edges {
        ...TradeEdgeFields
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
    ${TradeEdgeFieldsFragmentDoc}`;

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
export const TradesEventDocument = gql`
    subscription TradesEvent($marketId: ID!) {
  trades(marketId: $marketId) {
    ...TradeFields
  }
}
    ${TradeFieldsFragmentDoc}`;

/**
 * __useTradesEventSubscription__
 *
 * To run a query within a React component, call `useTradesEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTradesEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTradesEventSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useTradesEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<TradesEventSubscription, TradesEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TradesEventSubscription, TradesEventSubscriptionVariables>(TradesEventDocument, options);
      }
export type TradesEventSubscriptionHookResult = ReturnType<typeof useTradesEventSubscription>;
export type TradesEventSubscriptionResult = Apollo.SubscriptionResult<TradesEventSubscription>;