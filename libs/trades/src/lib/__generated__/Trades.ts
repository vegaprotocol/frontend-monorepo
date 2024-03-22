import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TradeFieldsFragment = { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, aggressor: Types.Side, type: Types.TradeType, market: { __typename?: 'Market', id: string } };

export type TradesQueryVariables = Types.Exact<{
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type TradesQuery = { __typename?: 'Query', trades?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, aggressor: Types.Side, type: Types.TradeType, market: { __typename?: 'Market', id: string } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type TradeUpdateFieldsFragment = { __typename?: 'TradeUpdate', id: string, price: string, size: string, createdAt: any, marketId: string, aggressor: Types.Side, type: Types.TradeType };

export type TradesUpdateSubscriptionVariables = Types.Exact<{
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type TradesUpdateSubscription = { __typename?: 'Subscription', tradesStream?: Array<{ __typename?: 'TradeUpdate', id: string, price: string, size: string, createdAt: any, marketId: string, aggressor: Types.Side, type: Types.TradeType }> | null };

export const TradeFieldsFragmentDoc = gql`
    fragment TradeFields on Trade {
  id
  price
  size
  createdAt
  aggressor
  market {
    id
  }
  type
}
    `;
export const TradeUpdateFieldsFragmentDoc = gql`
    fragment TradeUpdateFields on TradeUpdate {
  id
  price
  size
  createdAt
  marketId
  aggressor
  type
}
    `;
export const TradesDocument = gql`
    query Trades($marketIds: [ID!], $partyIds: [ID!], $pagination: Pagination) {
  trades(
    filter: {marketIds: $marketIds, partyIds: $partyIds}
    pagination: $pagination
  ) {
    edges {
      node {
        ...TradeFields
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
    ${TradeFieldsFragmentDoc}`;

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
 *      marketIds: // value for 'marketIds'
 *      partyIds: // value for 'partyIds'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useTradesQuery(baseOptions?: Apollo.QueryHookOptions<TradesQuery, TradesQueryVariables>) {
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
export const TradesUpdateDocument = gql`
    subscription TradesUpdate($marketIds: [ID!], $partyIds: [ID!]) {
  tradesStream(filter: {marketIds: $marketIds, partyIds: $partyIds}) {
    ...TradeUpdateFields
  }
}
    ${TradeUpdateFieldsFragmentDoc}`;

/**
 * __useTradesUpdateSubscription__
 *
 * To run a query within a React component, call `useTradesUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTradesUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTradesUpdateSubscription({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function useTradesUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<TradesUpdateSubscription, TradesUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TradesUpdateSubscription, TradesUpdateSubscriptionVariables>(TradesUpdateDocument, options);
      }
export type TradesUpdateSubscriptionHookResult = ReturnType<typeof useTradesUpdateSubscription>;
export type TradesUpdateSubscriptionResult = Apollo.SubscriptionResult<TradesUpdateSubscription>;