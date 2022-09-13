import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderFieldsFragment = { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } };

export type OrderConnectionFieldsFragment = { __typename?: 'OrderEdge', cursor?: string | null, node: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } } };

export type OrdersQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type OrdersQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, ordersConnection: { __typename?: 'OrderConnection', edges?: Array<{ __typename?: 'OrderEdge', cursor?: string | null, node: { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } } }> | null, pageInfo?: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } | null } } | null };

export type OrderEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderEventSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } }> | null };

export type OrderBusEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderBusEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'Account' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order', id: string, type?: Types.OrderType | null, side: Types.Side, size: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, price: string, timeInForce: Types.OrderTimeInForce, remaining: string, expiresAt?: string | null, createdAt: string, updatedAt?: string | null, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } } } } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export const OrderFieldsFragmentDoc = gql`
    fragment OrderFields on Order {
  id
  market {
    id
    name
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
    `;
export const OrderConnectionFieldsFragmentDoc = gql`
    fragment OrderConnectionFields on OrderEdge {
  node {
    ...OrderFields
  }
  cursor
}
    ${OrderFieldsFragmentDoc}`;
export const OrdersDocument = gql`
    query Orders($partyId: ID!, $pagination: Pagination) {
  party(id: $partyId) {
    id
    ordersConnection(pagination: $pagination) {
      edges {
        ...OrderConnectionFields
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
    ${OrderConnectionFieldsFragmentDoc}`;

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
export const OrderEventDocument = gql`
    subscription OrderEvent($partyId: ID!) {
  orders(partyId: $partyId) {
    ...OrderFields
  }
}
    ${OrderFieldsFragmentDoc}`;

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
export const OrderBusEventDocument = gql`
    subscription OrderBusEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
    type
    event {
      ... on Order {
        ...OrderFields
      }
    }
  }
}
    ${OrderFieldsFragmentDoc}`;

/**
 * __useOrderBusEventSubscription__
 *
 * To run a query within a React component, call `useOrderBusEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderBusEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderBusEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useOrderBusEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderBusEventSubscription, OrderBusEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderBusEventSubscription, OrderBusEventSubscriptionVariables>(OrderBusEventDocument, options);
      }
export type OrderBusEventSubscriptionHookResult = ReturnType<typeof useOrderBusEventSubscription>;
export type OrderBusEventSubscriptionResult = Apollo.SubscriptionResult<OrderBusEventSubscription>;