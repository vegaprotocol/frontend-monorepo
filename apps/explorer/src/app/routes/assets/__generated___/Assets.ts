import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetsQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsQueryQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string }, infrastructureFeeAccount?: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, market?: { __typename?: 'Market', id: string } | null } | null } } | null> | null } | null };


export const AssetsQueryDocument = gql`
    query AssetsQuery {
  assetsConnection {
    edges {
      node {
        id
        name
        symbol
        decimals
        source {
          ... on ERC20 {
            contractAddress
          }
          ... on BuiltinAsset {
            maxFaucetAmountMint
          }
        }
        infrastructureFeeAccount {
          type
          balance
          market {
            id
          }
        }
      }
    }
  }
}
    `;

/**
 * __useAssetsQueryQuery__
 *
 * To run a query within a React component, call `useAssetsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetsQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useAssetsQueryQuery(baseOptions?: Apollo.QueryHookOptions<AssetsQueryQuery, AssetsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetsQueryQuery, AssetsQueryQueryVariables>(AssetsQueryDocument, options);
      }
export function useAssetsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetsQueryQuery, AssetsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetsQueryQuery, AssetsQueryQueryVariables>(AssetsQueryDocument, options);
        }
export type AssetsQueryQueryHookResult = ReturnType<typeof useAssetsQueryQuery>;
export type AssetsQueryLazyQueryHookResult = ReturnType<typeof useAssetsQueryLazyQuery>;
export type AssetsQueryQueryResult = Apollo.QueryResult<AssetsQueryQuery, AssetsQueryQueryVariables>;