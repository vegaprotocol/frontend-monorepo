import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NetworkParamsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NetworkParamsQuery = { __typename?: 'Query', networkParameters?: Array<{ __typename?: 'NetworkParameter', key: string, value: string }> | null };


export const NetworkParamsDocument = gql`
    query NetworkParams {
  networkParameters {
    key
    value
  }
}
    `;

/**
 * __useNetworkParamsQuery__
 *
 * To run a query within a React component, call `useNetworkParamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNetworkParamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNetworkParamsQuery({
 *   variables: {
 *   },
 * });
 */
export function useNetworkParamsQuery(baseOptions?: Apollo.QueryHookOptions<NetworkParamsQuery, NetworkParamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NetworkParamsQuery, NetworkParamsQueryVariables>(NetworkParamsDocument, options);
      }
export function useNetworkParamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NetworkParamsQuery, NetworkParamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NetworkParamsQuery, NetworkParamsQueryVariables>(NetworkParamsDocument, options);
        }
export type NetworkParamsQueryHookResult = ReturnType<typeof useNetworkParamsQuery>;
export type NetworkParamsLazyQueryHookResult = ReturnType<typeof useNetworkParamsLazyQuery>;
export type NetworkParamsQueryResult = Apollo.QueryResult<NetworkParamsQuery, NetworkParamsQueryVariables>;