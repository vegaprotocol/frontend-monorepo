import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type WithdrawPageQueryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawPageQueryQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, withdrawals?: Array<{ __typename?: 'Withdrawal', id: string, txHash?: string | null }> | null, accounts?: Array<{ __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, symbol: string } }> | null } | null, assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } | null };


export const WithdrawPageQueryDocument = gql`
    query WithdrawPageQuery($partyId: ID!) {
  party(id: $partyId) {
    id
    withdrawals {
      id
      txHash
    }
    accounts {
      type
      balance
      asset {
        id
        symbol
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
 * __useWithdrawPageQueryQuery__
 *
 * To run a query within a React component, call `useWithdrawPageQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawPageQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawPageQueryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawPageQueryQuery(baseOptions: Apollo.QueryHookOptions<WithdrawPageQueryQuery, WithdrawPageQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WithdrawPageQueryQuery, WithdrawPageQueryQueryVariables>(WithdrawPageQueryDocument, options);
      }
export function useWithdrawPageQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WithdrawPageQueryQuery, WithdrawPageQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WithdrawPageQueryQuery, WithdrawPageQueryQueryVariables>(WithdrawPageQueryDocument, options);
        }
export type WithdrawPageQueryQueryHookResult = ReturnType<typeof useWithdrawPageQueryQuery>;
export type WithdrawPageQueryLazyQueryHookResult = ReturnType<typeof useWithdrawPageQueryLazyQuery>;
export type WithdrawPageQueryQueryResult = Apollo.QueryResult<WithdrawPageQueryQuery, WithdrawPageQueryQueryVariables>;