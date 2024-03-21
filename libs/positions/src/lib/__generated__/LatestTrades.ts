import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LatestTradeFieldsFragment = { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, type: Types.TradeType };

export type LatestTradeUpdateFieldsFragment = { __typename?: 'TradeUpdate', id: string, price: string, size: string, createdAt: any, type: Types.TradeType };

export type LatestTradesQueryVariables = Types.Exact<{
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type LatestTradesQuery = { __typename?: 'Query', trades?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', node: { __typename?: 'Trade', id: string, price: string, size: string, createdAt: any, type: Types.TradeType } }> } | null };

export type LatestTradesUpdateSubscriptionVariables = Types.Exact<{
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type LatestTradesUpdateSubscription = { __typename?: 'Subscription', tradesStream?: Array<{ __typename?: 'TradeUpdate', id: string, price: string, size: string, createdAt: any, type: Types.TradeType }> | null };

export const LatestTradeFieldsFragmentDoc = gql`
    fragment LatestTradeFields on Trade {
  id
  price
  size
  createdAt
  type
}
    `;
export const LatestTradeUpdateFieldsFragmentDoc = gql`
    fragment LatestTradeUpdateFields on TradeUpdate {
  id
  price
  size
  createdAt
  type
}
    `;
export const LatestTradesDocument = gql`
    query LatestTrades($marketIds: [ID!], $partyIds: [ID!]) {
  trades(filter: {marketIds: $marketIds, partyIds: $partyIds}) {
    edges {
      node {
        ...LatestTradeFields
      }
    }
  }
}
    ${LatestTradeFieldsFragmentDoc}`;

/**
 * __useLatestTradesQuery__
 *
 * To run a query within a React component, call `useLatestTradesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestTradesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestTradesQuery({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function useLatestTradesQuery(baseOptions?: Apollo.QueryHookOptions<LatestTradesQuery, LatestTradesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LatestTradesQuery, LatestTradesQueryVariables>(LatestTradesDocument, options);
      }
export function useLatestTradesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LatestTradesQuery, LatestTradesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LatestTradesQuery, LatestTradesQueryVariables>(LatestTradesDocument, options);
        }
export type LatestTradesQueryHookResult = ReturnType<typeof useLatestTradesQuery>;
export type LatestTradesLazyQueryHookResult = ReturnType<typeof useLatestTradesLazyQuery>;
export type LatestTradesQueryResult = Apollo.QueryResult<LatestTradesQuery, LatestTradesQueryVariables>;
export const LatestTradesUpdateDocument = gql`
    subscription LatestTradesUpdate($marketIds: [ID!], $partyIds: [ID!]) {
  tradesStream(filter: {marketIds: $marketIds, partyIds: $partyIds}) {
    ...LatestTradeUpdateFields
  }
}
    ${LatestTradeUpdateFieldsFragmentDoc}`;

/**
 * __useLatestTradesUpdateSubscription__
 *
 * To run a query within a React component, call `useLatestTradesUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLatestTradesUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestTradesUpdateSubscription({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function useLatestTradesUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<LatestTradesUpdateSubscription, LatestTradesUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<LatestTradesUpdateSubscription, LatestTradesUpdateSubscriptionVariables>(LatestTradesUpdateDocument, options);
      }
export type LatestTradesUpdateSubscriptionHookResult = ReturnType<typeof useLatestTradesUpdateSubscription>;
export type LatestTradesUpdateSubscriptionResult = Apollo.SubscriptionResult<LatestTradesUpdateSubscription>;