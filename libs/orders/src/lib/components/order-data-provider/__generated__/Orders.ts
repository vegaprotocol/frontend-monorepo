import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderFieldsFragment = { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder' } | null };

export type OrdersQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
  dateRange?: Types.InputMaybe<Types.DateRange>;
  filter?: Types.InputMaybe<Types.OrderFilter>;
}>;


export type OrdersQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, ordersConnection?: { __typename?: 'OrderConnection', edges?: Array<{ __typename?: 'OrderEdge', cursor?: string | null, node: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder' } | null } }> | null, pageInfo?: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } | null } | null } | null };

export type OrderUpdateFieldsFragment = { __typename?: 'OrderUpdate', id: string, marketId: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, liquidityProvisionId?: string | null, peggedOrder?: { __typename: 'PeggedOrder' } | null };

export type OrdersUpdateSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type OrdersUpdateSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'OrderUpdate', id: string, marketId: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, liquidityProvisionId?: string | null, peggedOrder?: { __typename: 'PeggedOrder' } | null }> | null };

export const OrderFieldsFragmentDoc = gql`
    fragment OrderFields on Order {
  id
  market {
    id
  }
  type
  side
  size
  status
  rejectionReason
  price
  timeInForce
  remaining
  expiresAt
  createdAt
  updatedAt
  liquidityProvision {
    __typename
  }
  peggedOrder {
    __typename
  }
}
    `;
export const OrderUpdateFieldsFragmentDoc = gql`
    fragment OrderUpdateFields on OrderUpdate {
  id
  marketId
  type
  side
  size
  status
  rejectionReason
  price
  timeInForce
  remaining
  expiresAt
  createdAt
  updatedAt
  liquidityProvisionId
  peggedOrder {
    __typename
  }
}
    `;
export const OrdersDocument = gql`
    query Orders($partyId: ID!, $pagination: Pagination, $dateRange: DateRange, $filter: OrderFilter) {
  party(id: $partyId) {
    id
    ordersConnection(
      pagination: $pagination
      dateRange: $dateRange
      filter: $filter
    ) {
      edges {
        node {
          ...OrderFields
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
    ${OrderFieldsFragmentDoc}`;

/**
 * __useOrdersQuery__
 *
 * To run a query within a React component, call `useOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrdersQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      pagination: // value for 'pagination'
 *      dateRange: // value for 'dateRange'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useOrdersQuery(baseOptions: Apollo.QueryHookOptions<OrdersQuery, OrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrdersQuery, OrdersQueryVariables>(OrdersDocument, options);
      }
export function useOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrdersQuery, OrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrdersQuery, OrdersQueryVariables>(OrdersDocument, options);
        }
export type OrdersQueryHookResult = ReturnType<typeof useOrdersQuery>;
export type OrdersLazyQueryHookResult = ReturnType<typeof useOrdersLazyQuery>;
export type OrdersQueryResult = Apollo.QueryResult<OrdersQuery, OrdersQueryVariables>;
export const OrdersUpdateDocument = gql`
    subscription OrdersUpdate($partyId: ID!, $marketId: ID) {
  orders(partyId: $partyId, marketId: $marketId) {
    ...OrderUpdateFields
  }
}
    ${OrderUpdateFieldsFragmentDoc}`;

/**
 * __useOrdersUpdateSubscription__
 *
 * To run a query within a React component, call `useOrdersUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrdersUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrdersUpdateSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useOrdersUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrdersUpdateSubscription, OrdersUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrdersUpdateSubscription, OrdersUpdateSubscriptionVariables>(OrdersUpdateDocument, options);
      }
export type OrdersUpdateSubscriptionHookResult = ReturnType<typeof useOrdersUpdateSubscription>;
export type OrdersUpdateSubscriptionResult = Apollo.SubscriptionResult<OrdersUpdateSubscription>;