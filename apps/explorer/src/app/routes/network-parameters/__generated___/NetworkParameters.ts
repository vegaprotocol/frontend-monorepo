import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NetworkParametersQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NetworkParametersQueryQuery = { __typename?: 'Query', networkParameters?: Array<{ __typename?: 'NetworkParameter', key: string, value: string }> | null };


export const NetworkParametersQueryDocument = gql`
    query NetworkParametersQuery {
  networkParameters {
    key
    value
  }
}
    `;

/**
 * __useNetworkParametersQueryQuery__
 *
 * To run a query within a React component, call `useNetworkParametersQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useNetworkParametersQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNetworkParametersQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useNetworkParametersQueryQuery(baseOptions?: Apollo.QueryHookOptions<NetworkParametersQueryQuery, NetworkParametersQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NetworkParametersQueryQuery, NetworkParametersQueryQueryVariables>(NetworkParametersQueryDocument, options);
      }
export function useNetworkParametersQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NetworkParametersQueryQuery, NetworkParametersQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NetworkParametersQueryQuery, NetworkParametersQueryQueryVariables>(NetworkParametersQueryDocument, options);
        }
export type NetworkParametersQueryQueryHookResult = ReturnType<typeof useNetworkParametersQueryQuery>;
export type NetworkParametersQueryLazyQueryHookResult = ReturnType<typeof useNetworkParametersQueryLazyQuery>;
export type NetworkParametersQueryQueryResult = Apollo.QueryResult<NetworkParametersQueryQuery, NetworkParametersQueryQueryVariables>;