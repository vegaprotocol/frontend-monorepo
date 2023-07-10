import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PendingWithdrawalFragment = { __typename: 'Withdrawal', pendingOnForeignChain: boolean, txHash?: string | null };

export type WithdrawalFieldsFragment = { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } }, details?: { __typename: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type WithdrawalsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawalsQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, withdrawalsConnection?: { __typename: 'WithdrawalsConnection', edges?: Array<{ __typename: 'WithdrawalEdge', node: { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } }, details?: { __typename: 'Erc20WithdrawalDetails', receiverAddress: string } | null } } | null> | null } | null } | null };

export type WithdrawalEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawalEventSubscription = { __typename: 'Subscription', busEvents?: Array<{ __typename: 'BusEvent', event: { __typename: 'Deposit' } | { __typename: 'TimeUpdate' } | { __typename: 'TransactionResult' } | { __typename: 'Withdrawal', id: string, status: Types.WithdrawalStatus, amount: string, createdTimestamp: any, withdrawnTimestamp?: any | null, txHash?: string | null, pendingOnForeignChain: boolean, asset: { __typename: 'Asset', id: string, name: string, symbol: string, decimals: number, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } }, details?: { __typename: 'Erc20WithdrawalDetails', receiverAddress: string } | null } }> | null };

export const PendingWithdrawalFragmentDoc = gql`
    fragment PendingWithdrawal on Withdrawal {
  pendingOnForeignChain @client
  txHash
}
    `;
export const WithdrawalFieldsFragmentDoc = gql`
    fragment WithdrawalFields on Withdrawal {
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
export const WithdrawalsDocument = gql`
    query Withdrawals($partyId: ID!) {
  party(id: $partyId) {
    id
    withdrawalsConnection {
      edges {
        node {
          ...WithdrawalFields
        }
      }
    }
  }
}
    ${WithdrawalFieldsFragmentDoc}`;

/**
 * __useWithdrawalsQuery__
 *
 * To run a query within a React component, call `useWithdrawalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawalsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawalsQuery(baseOptions: Apollo.QueryHookOptions<WithdrawalsQuery, WithdrawalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WithdrawalsQuery, WithdrawalsQueryVariables>(WithdrawalsDocument, options);
      }
export function useWithdrawalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WithdrawalsQuery, WithdrawalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WithdrawalsQuery, WithdrawalsQueryVariables>(WithdrawalsDocument, options);
        }
export type WithdrawalsQueryHookResult = ReturnType<typeof useWithdrawalsQuery>;
export type WithdrawalsLazyQueryHookResult = ReturnType<typeof useWithdrawalsLazyQuery>;
export type WithdrawalsQueryResult = Apollo.QueryResult<WithdrawalsQuery, WithdrawalsQueryVariables>;
export const WithdrawalEventDocument = gql`
    subscription WithdrawalEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Withdrawal]) {
    event {
      ... on Withdrawal {
        ...WithdrawalFields
      }
    }
  }
}
    ${WithdrawalFieldsFragmentDoc}`;

/**
 * __useWithdrawalEventSubscription__
 *
 * To run a query within a React component, call `useWithdrawalEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawalEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawalEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawalEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<WithdrawalEventSubscription, WithdrawalEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<WithdrawalEventSubscription, WithdrawalEventSubscriptionVariables>(WithdrawalEventDocument, options);
      }
export type WithdrawalEventSubscriptionHookResult = ReturnType<typeof useWithdrawalEventSubscription>;
export type WithdrawalEventSubscriptionResult = Apollo.SubscriptionResult<WithdrawalEventSubscription>;