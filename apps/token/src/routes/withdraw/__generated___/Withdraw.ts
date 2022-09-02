import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type WithdrawPageQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawPageQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accounts?: Array<{ __typename?: 'Account', balance: string, balanceFormatted: string, type: Types.AccountType, asset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } }> | null, withdrawals?: Array<{ __typename?: 'Withdrawal', id: string, amount: string, status: Types.WithdrawalStatus, createdTimestamp: string, withdrawnTimestamp?: string | null, txHash?: string | null, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number }, details?: { __typename?: 'Erc20WithdrawalDetails', receiverAddress: string } | null }> | null } | null, assetsConnection: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } };


export const WithdrawPageDocument = gql`
    query WithdrawPage($partyId: ID!) {
  party(id: $partyId) {
    id
    accounts {
      balance
      balanceFormatted @client
      type
      asset {
        id
        name
        symbol
        decimals
        source {
          __typename
          ... on ERC20 {
            contractAddress
          }
        }
      }
    }
    withdrawals {
      id
      amount
      asset {
        id
        symbol
        decimals
      }
      status
      createdTimestamp
      withdrawnTimestamp
      txHash
      details {
        ... on Erc20WithdrawalDetails {
          receiverAddress
        }
      }
    }
  }
  assetsConnection {
    edges {
      node {
        id
        symbol
        name
        decimals
        source {
          ... on ERC20 {
            contractAddress
          }
        }
      }
    }
  }
}
    `;

/**
 * __useWithdrawPageQuery__
 *
 * To run a query within a React component, call `useWithdrawPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawPageQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawPageQuery(baseOptions: Apollo.QueryHookOptions<WithdrawPageQuery, WithdrawPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WithdrawPageQuery, WithdrawPageQueryVariables>(WithdrawPageDocument, options);
      }
export function useWithdrawPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WithdrawPageQuery, WithdrawPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WithdrawPageQuery, WithdrawPageQueryVariables>(WithdrawPageDocument, options);
        }
export type WithdrawPageQueryHookResult = ReturnType<typeof useWithdrawPageQuery>;
export type WithdrawPageLazyQueryHookResult = ReturnType<typeof useWithdrawPageLazyQuery>;
export type WithdrawPageQueryResult = Apollo.QueryResult<WithdrawPageQuery, WithdrawPageQueryVariables>;