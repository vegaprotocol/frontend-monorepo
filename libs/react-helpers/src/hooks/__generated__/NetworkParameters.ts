import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NetworkParametersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NetworkParametersQuery = { __typename?: 'Query', networkParametersConnection: { __typename?: 'NetworkParametersConnection', edges?: Array<{ __typename?: 'NetworkParameterEdge', node: { __typename?: 'NetworkParameter', key: string, value: string } } | null> | null } };


export const NetworkParametersDocument = gql`
    query NetworkParameters {
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
 * __useNetworkParametersQuery__
 *
 * To run a query within a React component, call `useNetworkParametersQuery` and pass it any options that fit your needs.
 * When your component renders, `useNetworkParametersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNetworkParametersQuery({
 *   variables: {
 *   },
 * });
 */
export function useNetworkParametersQuery(baseOptions?: Apollo.QueryHookOptions<NetworkParametersQuery, NetworkParametersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NetworkParametersQuery, NetworkParametersQueryVariables>(NetworkParametersDocument, options);
      }
export function useNetworkParametersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NetworkParametersQuery, NetworkParametersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NetworkParametersQuery, NetworkParametersQueryVariables>(NetworkParametersDocument, options);
        }
export type NetworkParametersQueryHookResult = ReturnType<typeof useNetworkParametersQuery>;
export type NetworkParametersLazyQueryHookResult = ReturnType<typeof useNetworkParametersLazyQuery>;
export type NetworkParametersQueryResult = Apollo.QueryResult<NetworkParametersQuery, NetworkParametersQueryVariables>;