import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerPartyDepositFieldsFragment = { __typename?: 'Deposit', id: string, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, status: Types.DepositStatus, txHash?: string | null, asset: { __typename?: 'Asset', id: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, chainId: string } } };

export type ExplorerPartyWithdrawalFieldsFragment = { __typename?: 'Withdrawal', id: string, createdTimestamp: any, withdrawnTimestamp?: any | null, amount: string, status: Types.WithdrawalStatus, txHash?: string | null, asset: { __typename?: 'Asset', id: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, chainId: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null };

export type ExplorerPartyDepositsWithdrawalsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  first?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type ExplorerPartyDepositsWithdrawalsQuery = { __typename?: 'Query', partiesConnection?: { __typename?: 'PartyConnection', edges: Array<{ __typename?: 'PartyEdge', node: { __typename?: 'Party', depositsConnection?: { __typename?: 'DepositsConnection', edges?: Array<{ __typename?: 'DepositEdge', node: { __typename?: 'Deposit', id: string, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, status: Types.DepositStatus, txHash?: string | null, asset: { __typename?: 'Asset', id: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, chainId: string } } } } | null> | null } | null, withdrawalsConnection?: { __typename?: 'WithdrawalsConnection', edges?: Array<{ __typename?: 'WithdrawalEdge', node: { __typename?: 'Withdrawal', id: string, createdTimestamp: any, withdrawnTimestamp?: any | null, amount: string, status: Types.WithdrawalStatus, txHash?: string | null, asset: { __typename?: 'Asset', id: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, chainId: string } }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null } } | null> | null } | null } }> } | null };

export const ExplorerPartyDepositFieldsFragmentDoc = gql`
    fragment ExplorerPartyDepositFields on Deposit {
  id
  asset {
    id
    source {
      ... on ERC20 {
        contractAddress
        chainId
      }
    }
  }
  amount
  createdTimestamp
  creditedTimestamp
  status
  txHash
}
    `;
export const ExplorerPartyWithdrawalFieldsFragmentDoc = gql`
    fragment ExplorerPartyWithdrawalFields on Withdrawal {
  id
  createdTimestamp
  withdrawnTimestamp
  asset {
    id
    source {
      ... on ERC20 {
        contractAddress
        chainId
      }
    }
  }
  amount
  status
  txHash
  details {
    ... on Erc20WithdrawalDetails {
      receiverAddress
    }
  }
}
    `;
export const ExplorerPartyDepositsWithdrawalsDocument = gql`
    query ExplorerPartyDepositsWithdrawals($partyId: ID!, $first: Int = 3) {
  partiesConnection(id: $partyId) {
    edges {
      node {
        depositsConnection(pagination: {first: $first}) {
          edges {
            node {
              ...ExplorerPartyDepositFields
            }
          }
        }
        withdrawalsConnection(pagination: {first: $first}) {
          edges {
            node {
              ...ExplorerPartyWithdrawalFields
            }
          }
        }
      }
    }
  }
}
    ${ExplorerPartyDepositFieldsFragmentDoc}
${ExplorerPartyWithdrawalFieldsFragmentDoc}`;

/**
 * __useExplorerPartyDepositsWithdrawalsQuery__
 *
 * To run a query within a React component, call `useExplorerPartyDepositsWithdrawalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerPartyDepositsWithdrawalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerPartyDepositsWithdrawalsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useExplorerPartyDepositsWithdrawalsQuery(baseOptions: Apollo.QueryHookOptions<ExplorerPartyDepositsWithdrawalsQuery, ExplorerPartyDepositsWithdrawalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerPartyDepositsWithdrawalsQuery, ExplorerPartyDepositsWithdrawalsQueryVariables>(ExplorerPartyDepositsWithdrawalsDocument, options);
      }
export function useExplorerPartyDepositsWithdrawalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerPartyDepositsWithdrawalsQuery, ExplorerPartyDepositsWithdrawalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerPartyDepositsWithdrawalsQuery, ExplorerPartyDepositsWithdrawalsQueryVariables>(ExplorerPartyDepositsWithdrawalsDocument, options);
        }
export type ExplorerPartyDepositsWithdrawalsQueryHookResult = ReturnType<typeof useExplorerPartyDepositsWithdrawalsQuery>;
export type ExplorerPartyDepositsWithdrawalsLazyQueryHookResult = ReturnType<typeof useExplorerPartyDepositsWithdrawalsLazyQuery>;
export type ExplorerPartyDepositsWithdrawalsQueryResult = Apollo.QueryResult<ExplorerPartyDepositsWithdrawalsQuery, ExplorerPartyDepositsWithdrawalsQueryVariables>;