import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderEventFieldsFragment = { __typename?: 'Order', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: string, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: string | null, side: Types.Side, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } } } };

export type OrderEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: string, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: string | null, side: Types.Side, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } } } } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export const OrderEventFieldsFragmentDoc = gql`
    fragment OrderEventFields on Order {
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
    `;
export const OrderEventDocument = gql`
    subscription OrderEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
    type
    event {
      ... on Order {
        ...OrderEventFields
      }
    }
  }
}
    ${OrderEventFieldsFragmentDoc}`;

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