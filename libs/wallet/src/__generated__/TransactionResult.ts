import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransactionEventFieldsFragment = { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null };

export type TransactionEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type TransactionEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult', partyId: string, hash: string, status: boolean, error?: string | null } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export type WithdrawalBusEventFieldsFragment = { __typename?: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type WithdrawalBusEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawalBusEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null } }> | null };

export type OrderBusEventFieldsFragment = { __typename?: 'Order', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', symbol: string, decimals: number } } } } } };

export type OrderBusEventsSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type OrderBusEventsSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', type: Types.BusEventType, event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit' } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order', type?: Types.OrderType | null, id: string, status: Types.OrderStatus, rejectionReason?: Types.OrderRejectionReason | null, createdAt: any, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: any | null, side: Types.Side, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', symbol: string, decimals: number } } } } } } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

export type DepositBusEventFieldsFragment = { __typename?: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } };

export type DepositBusEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DepositBusEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };

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
export const OrderBusEventFieldsFragmentDoc = gql`
    fragment OrderBusEventFields on Order {
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
        code
        product {
          ... on Future {
            settlementAsset {
              symbol
              decimals
            }
          }
        }
      }
    }
  }
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
export const OrderBusEventsDocument = gql`
    subscription OrderBusEvents($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
    type
    event {
      ... on Order {
        ...OrderBusEventFields
      }
    }
  }
}
    ${OrderBusEventFieldsFragmentDoc}`;

/**
 * __useOrderBusEventsSubscription__
 *
 * To run a query within a React component, call `useOrderBusEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOrderBusEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderBusEventsSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useOrderBusEventsSubscription(baseOptions: Apollo.SubscriptionHookOptions<OrderBusEventsSubscription, OrderBusEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OrderBusEventsSubscription, OrderBusEventsSubscriptionVariables>(OrderBusEventsDocument, options);
      }
export type OrderBusEventsSubscriptionHookResult = ReturnType<typeof useOrderBusEventsSubscription>;
export type OrderBusEventsSubscriptionResult = Apollo.SubscriptionResult<OrderBusEventsSubscription>;
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