import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrderSubFieldsFragment = { __typename?: 'OrderUpdate', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, marketId: string };

export type OrderSubSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderSubSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'OrderUpdate', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, marketId: string }> | null };

export const OrderSubFieldsFragmentDoc = gql`
    fragment OrderSubFields on OrderUpdate {
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
  marketId
}
    `;
export const OrderSubDocument = gql`
    subscription OrderSub($partyId: ID!) {
  orders(filter: {partyIds: [$partyId]}) {
    ...OrderSubFields
  }
}
    ${OrderSubFieldsFragmentDoc}`;

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
