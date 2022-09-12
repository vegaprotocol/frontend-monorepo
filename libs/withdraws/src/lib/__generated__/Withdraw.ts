import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetFieldsFragment = { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } };

export type WithdrawFormQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type WithdrawFormQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, withdrawals?: Array<{ __typename?: 'Withdrawal', id: string, txHash?: string | null }> | null, accounts?: Array<{ __typename?: 'Account', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, symbol: string } }> | null } | null, assetsConnection: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, status: Types.AssetStatus, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } };

export const AssetFieldsFragmentDoc = gql`
    fragment AssetFields on Asset {
  id
  symbol
  name
  decimals
  status
  source {
    ... on ERC20 {
      contractAddress
    }
  }
}
    `;
export const WithdrawFormDocument = gql`
    query WithdrawForm($partyId: ID!) {
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
        ...AssetFields
      }
    }
  }
}
    ${AssetFieldsFragmentDoc}`;

/**
 * __useWithdrawFormQuery__
 *
 * To run a query within a React component, call `useWithdrawFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useWithdrawFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWithdrawFormQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useWithdrawFormQuery(baseOptions: Apollo.QueryHookOptions<WithdrawFormQuery, WithdrawFormQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WithdrawFormQuery, WithdrawFormQueryVariables>(WithdrawFormDocument, options);
      }
export function useWithdrawFormLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WithdrawFormQuery, WithdrawFormQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WithdrawFormQuery, WithdrawFormQueryVariables>(WithdrawFormDocument, options);
        }
export type WithdrawFormQueryHookResult = ReturnType<typeof useWithdrawFormQuery>;
export type WithdrawFormLazyQueryHookResult = ReturnType<typeof useWithdrawFormLazyQuery>;
export type WithdrawFormQueryResult = Apollo.QueryResult<WithdrawFormQuery, WithdrawFormQueryVariables>;