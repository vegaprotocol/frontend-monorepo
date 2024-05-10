import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderFieldsFragment = { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, postOnly?: boolean | null, reduceOnly?: boolean | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null };

export type OrdersQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  filter?: Types.InputMaybe<Types.OrderFilter>;
}>;


export type OrdersQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, ordersConnection?: { __typename?: 'OrderConnection', edges?: Array<{ __typename?: 'OrderEdge', cursor?: string | null, node: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, postOnly?: boolean | null, reduceOnly?: boolean | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null } }> | null, pageInfo?: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } | null } | null } | null };

export type OrderUpdateFieldsFragment = { __typename?: 'OrderUpdate', id: string, marketId: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, liquidityProvisionId?: string | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null };

export type OrdersUpdateSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type OrdersUpdateSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'OrderUpdate', id: string, marketId: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, liquidityProvisionId?: string | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null }> | null };

export type OrderSubmissionFieldsFragment = { __typename?: 'OrderSubmission', marketId: string, price: string, size: string, side: Types.Side, timeInForce: Types.OrderTimeInForce, expiresAt: any, type: Types.OrderType, reference?: string | null, postOnly?: boolean | null, reduceOnly?: boolean | null, peggedOrder?: { __typename?: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null };

export type StopOrderFieldsFragment = { __typename?: 'StopOrder', id: string, ocoLinkId?: string | null, expiresAt?: any | null, expiryStrategy?: Types.StopOrderExpiryStrategy | null, triggerDirection: Types.StopOrderTriggerDirection, sizeOverrideSetting: Types.StopOrderSizeOverrideSetting, sizeOverrideValue?: string | null, status: Types.StopOrderStatus, createdAt: any, updatedAt?: any | null, partyId: string, marketId: string, order?: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, postOnly?: boolean | null, reduceOnly?: boolean | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null } | null, trigger: { __typename?: 'StopOrderPrice', price: string } | { __typename?: 'StopOrderTrailingPercentOffset', trailingPercentOffset: string }, submission: { __typename?: 'OrderSubmission', marketId: string, price: string, size: string, side: Types.Side, timeInForce: Types.OrderTimeInForce, expiresAt: any, type: Types.OrderType, reference?: string | null, postOnly?: boolean | null, reduceOnly?: boolean | null, peggedOrder?: { __typename?: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null } };

export type StopOrdersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.StopOrderFilter>;
}>;


export type StopOrdersQuery = { __typename?: 'Query', stopOrders?: { __typename?: 'StopOrderConnection', edges?: Array<{ __typename?: 'StopOrderEdge', node?: { __typename?: 'StopOrder', id: string, ocoLinkId?: string | null, expiresAt?: any | null, expiryStrategy?: Types.StopOrderExpiryStrategy | null, triggerDirection: Types.StopOrderTriggerDirection, sizeOverrideSetting: Types.StopOrderSizeOverrideSetting, sizeOverrideValue?: string | null, status: Types.StopOrderStatus, createdAt: any, updatedAt?: any | null, partyId: string, marketId: string, order?: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, postOnly?: boolean | null, reduceOnly?: boolean | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null } | null, trigger: { __typename?: 'StopOrderPrice', price: string } | { __typename?: 'StopOrderTrailingPercentOffset', trailingPercentOffset: string }, submission: { __typename?: 'OrderSubmission', marketId: string, price: string, size: string, side: Types.Side, timeInForce: Types.OrderTimeInForce, expiresAt: any, type: Types.OrderType, reference?: string | null, postOnly?: boolean | null, reduceOnly?: boolean | null, peggedOrder?: { __typename?: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null } } | null }> | null } | null };

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
    reference
    offset
  }
  icebergOrder {
    __typename
    peakSize
    minimumVisibleSize
    reservedRemaining
  }
}
    `;
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
  postOnly
  reduceOnly
  liquidityProvision {
    __typename
  }
  peggedOrder {
    __typename
    reference
    offset
  }
  icebergOrder {
    __typename
    peakSize
    minimumVisibleSize
    reservedRemaining
  }
}
    `;
export const OrderSubmissionFieldsFragmentDoc = gql`
    fragment OrderSubmissionFields on OrderSubmission {
  marketId
  price
  size
  side
  timeInForce
  expiresAt
  type
  reference
  peggedOrder {
    reference
    offset
  }
  postOnly
  reduceOnly
}
    `;
export const StopOrderFieldsFragmentDoc = gql`
    fragment StopOrderFields on StopOrder {
  id
  ocoLinkId
  expiresAt
  expiryStrategy
  triggerDirection
  sizeOverrideSetting
  sizeOverrideValue
  status
  createdAt
  updatedAt
  partyId
  marketId
  order {
    ...OrderFields
  }
  trigger {
    ... on StopOrderPrice {
      price
    }
    ... on StopOrderTrailingPercentOffset {
      trailingPercentOffset
    }
  }
  submission {
    ...OrderSubmissionFields
  }
}
    ${OrderFieldsFragmentDoc}
${OrderSubmissionFieldsFragmentDoc}`;
export const OrdersDocument = gql`
    query Orders($partyId: ID!, $marketIds: [ID!], $pagination: Pagination, $filter: OrderFilter) {
  party(id: $partyId) {
    id
    ordersConnection(
      pagination: $pagination
      filter: {order: $filter, marketIds: $marketIds}
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
 *      marketIds: // value for 'marketIds'
 *      pagination: // value for 'pagination'
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
    subscription OrdersUpdate($partyId: ID!, $marketIds: [ID!]) {
  orders(filter: {partyIds: [$partyId], marketIds: $marketIds}) {
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
 *      marketIds: // value for 'marketIds'
 *   },
 * });
 */
export function useOrdersUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrdersUpdateSubscription, OrdersUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrdersUpdateSubscription, OrdersUpdateSubscriptionVariables>(OrdersUpdateDocument, options);
      }
export type OrdersUpdateSubscriptionHookResult = ReturnType<typeof useOrdersUpdateSubscription>;
export type OrdersUpdateSubscriptionResult = Apollo.SubscriptionResult<OrdersUpdateSubscription>;
export const StopOrdersDocument = gql`
    query StopOrders($filter: StopOrderFilter) {
  stopOrders(filter: $filter) {
    edges {
      node {
        ...StopOrderFields
      }
    }
  }
}
    ${StopOrderFieldsFragmentDoc}`;

/**
 * __useStopOrdersQuery__
 *
 * To run a query within a React component, call `useStopOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useStopOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStopOrdersQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useStopOrdersQuery(baseOptions?: Apollo.QueryHookOptions<StopOrdersQuery, StopOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StopOrdersQuery, StopOrdersQueryVariables>(StopOrdersDocument, options);
      }
export function useStopOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StopOrdersQuery, StopOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StopOrdersQuery, StopOrdersQueryVariables>(StopOrdersDocument, options);
        }
export type StopOrdersQueryHookResult = ReturnType<typeof useStopOrdersQuery>;
export type StopOrdersLazyQueryHookResult = ReturnType<typeof useStopOrdersLazyQuery>;
export type StopOrdersQueryResult = Apollo.QueryResult<StopOrdersQuery, StopOrdersQueryVariables>;