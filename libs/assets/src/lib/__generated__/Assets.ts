import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssetsConnectionQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssetsConnectionQuery = { __typename?: 'Query', assetsConnection: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } } | null> | null } };


export const AssetsConnectionDocument = gql`
    query AssetsConnection {
  assetsConnection {
    edges {
      node {
        id
        name
        symbol
        decimals
        quantum
        source {
          ... on ERC20 {
            contractAddress
            lifetimeLimit
            withdrawThreshold
          }
        }
      }
    }
  }
}
    `;

/**
 * __useAssetsConnectionQuery__
 *
 * To run a query within a React component, call `useAssetsConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetsConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetsConnectionQuery({
 *   variables: {
 *   },
 * });
 */
export function useAssetsConnectionQuery(baseOptions?: Apollo.QueryHookOptions<AssetsConnectionQuery, AssetsConnectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AssetsConnectionQuery, AssetsConnectionQueryVariables>(AssetsConnectionDocument, options);
      }
export function useAssetsConnectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AssetsConnectionQuery, AssetsConnectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AssetsConnectionQuery, AssetsConnectionQueryVariables>(AssetsConnectionDocument, options);
        }
export type AssetsConnectionQueryHookResult = ReturnType<typeof useAssetsConnectionQuery>;
export type AssetsConnectionLazyQueryHookResult = ReturnType<typeof useAssetsConnectionLazyQuery>;
export type AssetsConnectionQueryResult = Apollo.QueryResult<AssetsConnectionQuery, AssetsConnectionQueryVariables>;