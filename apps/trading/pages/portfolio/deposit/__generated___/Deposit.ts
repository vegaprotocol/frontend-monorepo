import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DepositPageQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DepositPageQuery = { __typename?: 'Query', assetsConnection: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } };


export const DepositPageDocument = gql`
    query DepositPage {
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
 * __useDepositPageQuery__
 *
 * To run a query within a React component, call `useDepositPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useDepositPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useDepositPageQuery(baseOptions?: Apollo.QueryHookOptions<DepositPageQuery, DepositPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DepositPageQuery, DepositPageQueryVariables>(DepositPageDocument, options);
      }
export function useDepositPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DepositPageQuery, DepositPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DepositPageQuery, DepositPageQueryVariables>(DepositPageDocument, options);
        }
export type DepositPageQueryHookResult = ReturnType<typeof useDepositPageQuery>;
export type DepositPageLazyQueryHookResult = ReturnType<typeof useDepositPageLazyQuery>;
export type DepositPageQueryResult = Apollo.QueryResult<DepositPageQuery, DepositPageQueryVariables>;