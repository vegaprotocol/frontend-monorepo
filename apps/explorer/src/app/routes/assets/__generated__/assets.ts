import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerAssetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerAssetsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string }, infrastructureFeeAccount?: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, market?: { __typename?: 'Market', id: string } | null } | null } } | null> | null } | null };


export const ExplorerAssetsDocument = gql`
    query ExplorerAssets {
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
 * __useExplorerAssetsQuery__
 *
 * To run a query within a React component, call `useExplorerAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerAssetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerAssetsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerAssetsQuery, ExplorerAssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerAssetsQuery, ExplorerAssetsQueryVariables>(ExplorerAssetsDocument, options);
      }
export function useExplorerAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerAssetsQuery, ExplorerAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerAssetsQuery, ExplorerAssetsQueryVariables>(ExplorerAssetsDocument, options);
        }
export type ExplorerAssetsQueryHookResult = ReturnType<typeof useExplorerAssetsQuery>;
export type ExplorerAssetsLazyQueryHookResult = ReturnType<typeof useExplorerAssetsLazyQuery>;
export type ExplorerAssetsQueryResult = Apollo.QueryResult<ExplorerAssetsQuery, ExplorerAssetsQueryVariables>;