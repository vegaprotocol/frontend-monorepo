import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DepositsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DepositsQuery = { __typename?: 'Query', assetsConnection: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, source: { __typename?: 'BuiltinAsset' } | { __typename?: 'ERC20', contractAddress: string } } } | null> | null } };


export const DepositsDocument = gql`
    query Deposits {
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
 * __useDepositsQuery__
 *
 * To run a query within a React component, call `useDepositsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDepositsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDepositsQuery(baseOptions?: Apollo.QueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
      }
export function useDepositsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
        }
export type DepositsQueryHookResult = ReturnType<typeof useDepositsQuery>;
export type DepositsLazyQueryHookResult = ReturnType<typeof useDepositsLazyQuery>;
export type DepositsQueryResult = Apollo.QueryResult<DepositsQuery, DepositsQueryVariables>;