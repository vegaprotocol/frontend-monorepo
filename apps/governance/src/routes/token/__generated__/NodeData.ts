import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NodeDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NodeDataQuery = { __typename: 'Query', nodeData?: { __typename: 'NodeData', stakedTotal: string } | null };


export const NodeDataDocument = gql`
    query NodeData {
  nodeData {
    stakedTotal
  }
}
    `;

/**
 * __useNodeDataQuery__
 *
 * To run a query within a React component, call `useNodeDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useNodeDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodeDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useNodeDataQuery(baseOptions?: Apollo.QueryHookOptions<NodeDataQuery, NodeDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NodeDataQuery, NodeDataQueryVariables>(NodeDataDocument, options);
      }
export function useNodeDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NodeDataQuery, NodeDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NodeDataQuery, NodeDataQueryVariables>(NodeDataDocument, options);
        }
export type NodeDataQueryHookResult = ReturnType<typeof useNodeDataQuery>;
export type NodeDataLazyQueryHookResult = ReturnType<typeof useNodeDataLazyQuery>;
export type NodeDataQueryResult = Apollo.QueryResult<NodeDataQuery, NodeDataQueryVariables>;