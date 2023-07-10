import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerBundleSignersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerBundleSignersQuery = { __typename: 'Query', networkParameter?: { __typename: 'NetworkParameter', value: string } | null, nodesConnection: { __typename: 'NodesConnection', edges?: Array<{ __typename: 'NodeEdge', node: { __typename: 'Node', id: string, name: string, status: Types.NodeStatus, ethereumAddress: string, pubkey: string, tmPubkey: string } } | null> | null } };


export const ExplorerBundleSignersDocument = gql`
    query ExplorerBundleSigners {
  networkParameter(key: "blockchains.ethereumConfig") {
    value
  }
  nodesConnection(pagination: {first: 25}) {
    edges {
      node {
        id
        name
        status
        ethereumAddress
        pubkey
        tmPubkey
      }
    }
  }
}
    `;

/**
 * __useExplorerBundleSignersQuery__
 *
 * To run a query within a React component, call `useExplorerBundleSignersQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerBundleSignersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerBundleSignersQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerBundleSignersQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerBundleSignersQuery, ExplorerBundleSignersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerBundleSignersQuery, ExplorerBundleSignersQueryVariables>(ExplorerBundleSignersDocument, options);
      }
export function useExplorerBundleSignersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerBundleSignersQuery, ExplorerBundleSignersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerBundleSignersQuery, ExplorerBundleSignersQueryVariables>(ExplorerBundleSignersDocument, options);
        }
export type ExplorerBundleSignersQueryHookResult = ReturnType<typeof useExplorerBundleSignersQuery>;
export type ExplorerBundleSignersLazyQueryHookResult = ReturnType<typeof useExplorerBundleSignersLazyQuery>;
export type ExplorerBundleSignersQueryResult = Apollo.QueryResult<ExplorerBundleSignersQuery, ExplorerBundleSignersQueryVariables>;