import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrdersQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type OrdersQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, ordersConnection?: { __typename?: 'OrderConnection', edges?: Array<{ __typename?: 'OrderEdge', cursor?: string | null, node: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } } }> | null, pageInfo?: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } | null } | null } | null };

export type OrderSubSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderSubSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'OrderUpdate', id: string, marketId: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null }> | null };

export type OrderEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'Account' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: string, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: string | null, side: Types.Side, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } } } } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };


export const OrdersDocument = gql`
    query Orders($partyId: ID!, $pagination: Pagination) {
  party(id: $partyId) {
    id
    ordersConnection(pagination: $pagination) {
      edges {
        node {
          id
          market {
            id
            decimalPlaces
            positionDecimalPlaces
            tradableInstrument {
              instrument {
                id
                name
                code
              }
            }
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
export const OrderSubDocument = gql`
    subscription OrderSub($partyId: ID!) {
  orders(partyId: $partyId) {
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
  }
}
    `;

/**
 * __useOrderSubSubscription__
 *
 * To run a query within a React component, call `useOrderSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderSubSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useOrderSubSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderSubSubscription, OrderSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderSubSubscription, OrderSubSubscriptionVariables>(OrderSubDocument, options);
      }
export type OrderSubSubscriptionHookResult = ReturnType<typeof useOrderSubSubscription>;
export type OrderSubSubscriptionResult = Apollo.SubscriptionResult<OrderSubSubscription>;
export const OrderEventDocument = gql`
    subscription OrderEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
    type
    event {
      ... on Order {
        type
        id
        status
        rejectionReason
        createdAt
        size
        price
        timeInForce
        expiresAt
        side
        market {
          id
          decimalPlaces
          positionDecimalPlaces
          tradableInstrument {
            instrument {
              name
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useOrderEventSubscription__
 *
 * To run a query within a React component, call `useOrderEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useOrderEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderEventSubscription, OrderEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderEventSubscription, OrderEventSubscriptionVariables>(OrderEventDocument, options);
      }
export type OrderEventSubscriptionHookResult = ReturnType<typeof useOrderEventSubscription>;
export type OrderEventSubscriptionResult = Apollo.SubscriptionResult<OrderEventSubscription>;