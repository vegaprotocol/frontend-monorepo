import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderByIdQueryVariables = Types.Exact<{
  orderId: Types.Scalars['ID'];
}>;


export type OrderByIdQuery = { __typename?: 'Query', orderByID: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: any | null, createdAt: any, updatedAt?: any | null, postOnly?: boolean | null, reduceOnly?: boolean | null, market: { __typename?: 'Market', id: string }, liquidityProvision?: { __typename: 'LiquidityProvision' } | null, peggedOrder?: { __typename: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null, icebergOrder?: { __typename: 'IcebergOrder', peakSize: string, minimumVisibleSize: string, reservedRemaining: string } | null } };

export type StopOrderByIdQueryVariables = Types.Exact<{
  stopOrderId: Types.Scalars['ID'];
}>;


export type StopOrderByIdQuery = { __typename?: 'Query', stopOrder?: { __typename?: 'StopOrder', id: string, ocoLinkId?: string | null, expiresAt?: any | null, expiryStrategy?: Types.StopOrderExpiryStrategy | null, triggerDirection: Types.StopOrderTriggerDirection, status: Types.StopOrderStatus, createdAt: any, updatedAt?: any | null, partyId: string, marketId: string, trigger: { __typename?: 'StopOrderPrice', price: string } | { __typename?: 'StopOrderTrailingPercentOffset', trailingPercentOffset: string }, submission: { __typename?: 'OrderSubmission', marketId: string, price: string, size: string, side: Types.Side, timeInForce: Types.OrderTimeInForce, expiresAt: any, type: Types.OrderType, reference?: string | null, postOnly?: boolean | null, reduceOnly?: boolean | null, peggedOrder?: { __typename?: 'PeggedOrder', reference: Types.PeggedReference, offset: string } | null } } | null };


export const OrderByIdDocument = gql`
    query OrderById($orderId: ID!) {
  orderByID(id: $orderId) {
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
}
    `;

/**
 * __useOrderByIdQuery__
 *
 * To run a query within a React component, call `useOrderByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderByIdQuery({
 *   variables: {
 *      orderId: // value for 'orderId'
 *   },
 * });
 */
export function useOrderByIdQuery(baseOptions: Apollo.QueryHookOptions<OrderByIdQuery, OrderByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrderByIdQuery, OrderByIdQueryVariables>(OrderByIdDocument, options);
      }
export function useOrderByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrderByIdQuery, OrderByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrderByIdQuery, OrderByIdQueryVariables>(OrderByIdDocument, options);
        }
export type OrderByIdQueryHookResult = ReturnType<typeof useOrderByIdQuery>;
export type OrderByIdLazyQueryHookResult = ReturnType<typeof useOrderByIdLazyQuery>;
export type OrderByIdQueryResult = Apollo.QueryResult<OrderByIdQuery, OrderByIdQueryVariables>;
export const StopOrderByIdDocument = gql`
    query StopOrderById($stopOrderId: ID!) {
  stopOrder(id: $stopOrderId) {
    id
    ocoLinkId
    expiresAt
    expiryStrategy
    triggerDirection
    status
    createdAt
    updatedAt
    partyId
    marketId
    trigger {
      ... on StopOrderPrice {
        price
      }
      ... on StopOrderTrailingPercentOffset {
        trailingPercentOffset
      }
    }
    submission {
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
  }
}
    `;

/**
 * __useStopOrderByIdQuery__
 *
 * To run a query within a React component, call `useStopOrderByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useStopOrderByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStopOrderByIdQuery({
 *   variables: {
 *      stopOrderId: // value for 'stopOrderId'
 *   },
 * });
 */
export function useStopOrderByIdQuery(baseOptions: Apollo.QueryHookOptions<StopOrderByIdQuery, StopOrderByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StopOrderByIdQuery, StopOrderByIdQueryVariables>(StopOrderByIdDocument, options);
      }
export function useStopOrderByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StopOrderByIdQuery, StopOrderByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StopOrderByIdQuery, StopOrderByIdQueryVariables>(StopOrderByIdDocument, options);
        }
export type StopOrderByIdQueryHookResult = ReturnType<typeof useStopOrderByIdQuery>;
export type StopOrderByIdLazyQueryHookResult = ReturnType<typeof useStopOrderByIdLazyQuery>;
export type StopOrderByIdQueryResult = Apollo.QueryResult<StopOrderByIdQuery, StopOrderByIdQueryVariables>;