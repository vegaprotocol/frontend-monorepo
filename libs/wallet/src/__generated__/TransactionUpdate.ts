import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransactionResultEventFragment = { __typename?: 'TransactionResult', partyId: string, hash: string, error?: string | null, status: boolean };

export type WithdrawalEventFragment = { __typename?: 'Withdrawal', id: string, amount: string, createdTimestamp: string, withdrawnTimestamp?: string | null, txHash?: string | null, pendingOnForeignChain: boolean, withdrawalStatus: Types.WithdrawalStatus, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type OrderEventFragment = { __typename?: 'Order', type?: Types.OrderType | null, id: string, rejectionReason?: Types.OrderRejectionReason | null, createdAt: string, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: string | null, side: Types.Side, orderStatus: Types.OrderStatus, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } } } };

export type DepositEventFragment = { __typename?: 'Deposit', id: string, amount: string, createdTimestamp: string, creditedTimestamp?: string | null, txHash?: string | null, depositStatus: Types.DepositStatus, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } };

export type TransactionUpdateSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type TransactionUpdateSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'AccountEvent' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit', id: string, amount: string, createdTimestamp: string, creditedTimestamp?: string | null, txHash?: string | null, depositStatus: Types.DepositStatus, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order', type?: Types.OrderType | null, id: string, rejectionReason?: Types.OrderRejectionReason | null, createdAt: string, size: string, price: string, timeInForce: Types.OrderTimeInForce, expiresAt?: string | null, side: Types.Side, orderStatus: Types.OrderStatus, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string } } } } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransactionResult', partyId: string, hash: string, error?: string | null, status: boolean } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal', id: string, amount: string, createdTimestamp: string, withdrawnTimestamp?: string | null, txHash?: string | null, pendingOnForeignChain: boolean, withdrawalStatus: Types.WithdrawalStatus, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null } }> | null };

export const TransactionResultEventFragmentDoc = gql`
    fragment TransactionResultEvent on TransactionResult {
  partyId
  hash
  status: status
  error
}
    `;
export const WithdrawalEventFragmentDoc = gql`
    fragment WithdrawalEvent on Withdrawal {
  id
  withdrawalStatus: status
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
export const OrderEventFragmentDoc = gql`
    fragment OrderEvent on Order {
  type
  id
  orderStatus: status
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
export const DepositEventFragmentDoc = gql`
    fragment DepositEvent on Deposit {
  id
  depositStatus: status
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
export const TransactionUpdateDocument = gql`
    subscription TransactionUpdate($partyId: ID!) {
  busEvents(
    partyId: $partyId
    batchSize: 0
    types: [Withdrawal, Deposit, TransactionResult, Order]
  ) {
    event {
      ... on Deposit {
        ...DepositEvent
      }
      ... on TransactionResult {
        ...TransactionResultEvent
      }
      ... on Order {
        ...OrderEvent
      }
      ... on Withdrawal {
        ...WithdrawalEvent
      }
    }
  }
}
    ${DepositEventFragmentDoc}
${TransactionResultEventFragmentDoc}
${OrderEventFragmentDoc}
${WithdrawalEventFragmentDoc}`;

/**
 * __useTransactionUpdateSubscription__
 *
 * To run a query within a React component, call `useTransactionUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTransactionUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionUpdateSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useTransactionUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<TransactionUpdateSubscription, TransactionUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<TransactionUpdateSubscription, TransactionUpdateSubscriptionVariables>(TransactionUpdateDocument, options);
      }
export type TransactionUpdateSubscriptionHookResult = ReturnType<typeof useTransactionUpdateSubscription>;
export type TransactionUpdateSubscriptionResult = Apollo.SubscriptionResult<TransactionUpdateSubscription>;