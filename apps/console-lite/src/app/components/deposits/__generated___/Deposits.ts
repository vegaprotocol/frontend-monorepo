import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DepositAssetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DepositAssetsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } | null };


export const DepositAssetsDocument = gql`
    query DepositAssets {
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
        }
      }
    }
  }
}
    `;

/**
 * __useDepositAssetsQuery__
 *
 * To run a query within a React component, call `useDepositAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDepositAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositAssetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDepositAssetsQuery(baseOptions?: Apollo.QueryHookOptions<DepositAssetsQuery, DepositAssetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DepositAssetsQuery, DepositAssetsQueryVariables>(DepositAssetsDocument, options);
      }
export function useDepositAssetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DepositAssetsQuery, DepositAssetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DepositAssetsQuery, DepositAssetsQueryVariables>(DepositAssetsDocument, options);
        }
export type DepositAssetsQueryHookResult = ReturnType<typeof useDepositAssetsQuery>;
export type DepositAssetsLazyQueryHookResult = ReturnType<typeof useDepositAssetsLazyQuery>;
export type DepositAssetsQueryResult = Apollo.QueryResult<DepositAssetsQuery, DepositAssetsQueryVariables>;