import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransactionEventFieldsFragment = { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null };

export type TransactionEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type TransactionEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'Deposit' } | { __typename?: 'TimeUpdate' } | { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null } | { __typename?: 'Withdrawal' } }> | null };

export type WithdrawalBusEventFieldsFragment = { __typename?: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type WithdrawalBusEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawalBusEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'Deposit' } | { __typename?: 'TimeUpdate' } | { __typename?: 'TransactionResult' } | { __typename?: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null } }> | null };

export type OrderTxUpdateFieldsFragment = { __typename?: 'OrderUpdate', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, marketId: string };

export type OrderTxUpdateSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderTxUpdateSubscription = { __typename?: 'Subscription', orders?: Array<{ __typename?: 'OrderUpdate', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, marketId: string  }> | null };

export type DepositBusEventFieldsFragment = { __typename?: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } };

export type DepositBusEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DepositBusEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } | { __typename?: 'TimeUpdate' } | { __typename?: 'TransactionResult' } | { __typename?: 'Withdrawal' } }> | null };

export const TransactionEventFieldsFragmentDoc = gql`
    fragment TransactionEventFields on TransactionResult {
  partyId
  hash
  status
  error
}
    `;
export const WithdrawalBusEventFieldsFragmentDoc = gql`
    fragment WithdrawalBusEventFields on Withdrawal {
  id
  status
  amount
  asset {
    id
    name
    symbol
    decimals
    status
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
  createdTimestamp
  withdrawnTimestamp
  txHash
  details {
    ... on Erc20WithdrawalDetails {
      receiverAddress
    }
  }
  pendingOnForeignChain @client
}
    `;
export const OrderTxUpdateFieldsFragmentDoc = gql`
    fragment OrderTxUpdateFields on OrderUpdate {
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
  remaining
}
    `;
export const DepositBusEventFieldsFragmentDoc = gql`
    fragment DepositBusEventFields on Deposit {
  id
  status
  amount
  asset {
    id
    symbol
    decimals
  }
  createdTimestamp
  creditedTimestamp
  txHash
}
    `;
export const TransactionEventDocument = gql`
    subscription TransactionEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [TransactionResult]) {
    type
    event {
      ... on TransactionResult {
        ...TransactionEventFields
      }
    }
  }
}
    ${TransactionEventFieldsFragmentDoc}`;

/**
 * __useTransactionEventSubscription__
 *
 * To run a query within a React component, call `useTransactionEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTransactionEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useTransactionEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<TransactionEventSubscription, TransactionEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TransactionEventSubscription, TransactionEventSubscriptionVariables>(TransactionEventDocument, options);
      }
export type TransactionEventSubscriptionHookResult = ReturnType<typeof useTransactionEventSubscription>;
export type TransactionEventSubscriptionResult = Apollo.SubscriptionResult<TransactionEventSubscription>;
export const WithdrawalBusEventDocument = gql`
    subscription WithdrawalBusEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Withdrawal]) {
    event {
      ... on Withdrawal {
        ...WithdrawalBusEventFields
      }
    }
  }
}
    ${WithdrawalBusEventFieldsFragmentDoc}`;

/**
 * __useWithdrawalBusEventSubscription__
 *
 * To run a query within a React component, call `useWithdrawalBusEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawalBusEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawalBusEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawalBusEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<WithdrawalBusEventSubscription, WithdrawalBusEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<WithdrawalBusEventSubscription, WithdrawalBusEventSubscriptionVariables>(WithdrawalBusEventDocument, options);
      }
export type WithdrawalBusEventSubscriptionHookResult = ReturnType<typeof useWithdrawalBusEventSubscription>;
export type WithdrawalBusEventSubscriptionResult = Apollo.SubscriptionResult<WithdrawalBusEventSubscription>;
export const OrderTxUpdateDocument = gql`
    subscription OrderTxUpdate($partyId: ID!) {
  orders(filter: {partyIds: [$partyId]}) {
    ...OrderTxUpdateFields
  }
}
    ${OrderTxUpdateFieldsFragmentDoc}`;

/**
 * __useOrderTxUpdateSubscription__
 *
 * To run a query within a React component, call `useOrderTxUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderTxUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderTxUpdateSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useOrderTxUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderTxUpdateSubscription, OrderTxUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderTxUpdateSubscription, OrderTxUpdateSubscriptionVariables>(OrderTxUpdateDocument, options);
      }
export type OrderTxUpdateSubscriptionHookResult = ReturnType<typeof useOrderTxUpdateSubscription>;
export type OrderTxUpdateSubscriptionResult = Apollo.SubscriptionResult<OrderTxUpdateSubscription>;
export const DepositBusEventDocument = gql`
    subscription DepositBusEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
    event {
      ... on Deposit {
        ...DepositBusEventFields
      }
    }
  }
}
    ${DepositBusEventFieldsFragmentDoc}`;

/**
 * __useDepositBusEventSubscription__
 *
 * To run a query within a React component, call `useDepositBusEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useDepositBusEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositBusEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useDepositBusEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<DepositBusEventSubscription, DepositBusEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<DepositBusEventSubscription, DepositBusEventSubscriptionVariables>(DepositBusEventDocument, options);
      }
export type DepositBusEventSubscriptionHookResult = ReturnType<typeof useDepositBusEventSubscription>;
export type DepositBusEventSubscriptionResult = Apollo.SubscriptionResult<DepositBusEventSubscription>;
