import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NodeGuardQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NodeGuardQuery = { __typename: 'Query', lastBlockHeight: string, networkParametersConnection: { __typename: 'NetworkParametersConnection', edges?: Array<{ __typename: 'NetworkParameterEdge', node: { __typename: 'NetworkParameter', key: string, value: string } } | null> | null } };


export const NodeGuardDocument = gql`
    query NodeGuard {
  lastBlockHeight
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
 * __useNodeGuardQuery__
 *
 * To run a query within a React component, call `useNodeGuardQuery` and pass it any options that fit your needs.
 * When your component renders, `useNodeGuardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodeGuardQuery({
 *   variables: {
 *   },
 * });
 */
export function useNodeGuardQuery(baseOptions?: Apollo.QueryHookOptions<NodeGuardQuery, NodeGuardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NodeGuardQuery, NodeGuardQueryVariables>(NodeGuardDocument, options);
      }
export function useNodeGuardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NodeGuardQuery, NodeGuardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NodeGuardQuery, NodeGuardQueryVariables>(NodeGuardDocument, options);
        }
export type NodeGuardQueryHookResult = ReturnType<typeof useNodeGuardQuery>;
export type NodeGuardLazyQueryHookResult = ReturnType<typeof useNodeGuardLazyQuery>;
export type NodeGuardQueryResult = Apollo.QueryResult<NodeGuardQuery, NodeGuardQueryVariables>;