import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NetworkParamsQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NetworkParamsQueryQuery = { __typename?: 'Query', networkParametersConnection: { __typename?: 'NetworkParametersConnection', edges?: Array<{ __typename?: 'NetworkParameterEdge', node: { __typename?: 'NetworkParameter', key: string, value: string } } | null> | null } };


export const NetworkParamsQueryDocument = gql`
    query NetworkParamsQuery {
  networkParametersConnection {
    edges {
      node {
        key
        value
      }
    }
  }
}
    `;

/**
 * __useNetworkParamsQueryQuery__
 *
 * To run a query within a React component, call `useNetworkParamsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useNetworkParamsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNetworkParamsQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useNetworkParamsQueryQuery(baseOptions?: Apollo.QueryHookOptions<NetworkParamsQueryQuery, NetworkParamsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NetworkParamsQueryQuery, NetworkParamsQueryQueryVariables>(NetworkParamsQueryDocument, options);
      }
export function useNetworkParamsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NetworkParamsQueryQuery, NetworkParamsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NetworkParamsQueryQuery, NetworkParamsQueryQueryVariables>(NetworkParamsQueryDocument, options);
        }
export type NetworkParamsQueryQueryHookResult = ReturnType<typeof useNetworkParamsQueryQuery>;
export type NetworkParamsQueryLazyQueryHookResult = ReturnType<typeof useNetworkParamsQueryLazyQuery>;
export type NetworkParamsQueryQueryResult = Apollo.QueryResult<NetworkParamsQueryQuery, NetworkParamsQueryQueryVariables>;