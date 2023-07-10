import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerNodeNamesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerNodeNamesQuery = { __typename: 'Query', nodesConnection: { __typename: 'NodesConnection', edges?: Array<{ __typename: 'NodeEdge', node: { __typename: 'Node', id: string, name: string, pubkey: string, tmPubkey: string, ethereumAddress: string } } | null> | null } };


export const ExplorerNodeNamesDocument = gql`
    query ExplorerNodeNames {
  nodesConnection {
    edges {
      node {
        id
        name
        pubkey
        tmPubkey
        ethereumAddress
      }
    }
  }
}
    `;

/**
 * __useExplorerNodeNamesQuery__
 *
 * To run a query within a React component, call `useExplorerNodeNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerNodeNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerNodeNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerNodeNamesQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerNodeNamesQuery, ExplorerNodeNamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerNodeNamesQuery, ExplorerNodeNamesQueryVariables>(ExplorerNodeNamesDocument, options);
      }
export function useExplorerNodeNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerNodeNamesQuery, ExplorerNodeNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerNodeNamesQuery, ExplorerNodeNamesQueryVariables>(ExplorerNodeNamesDocument, options);
        }
export type ExplorerNodeNamesQueryHookResult = ReturnType<typeof useExplorerNodeNamesQuery>;
export type ExplorerNodeNamesLazyQueryHookResult = ReturnType<typeof useExplorerNodeNamesLazyQuery>;
export type ExplorerNodeNamesQueryResult = Apollo.QueryResult<ExplorerNodeNamesQuery, ExplorerNodeNamesQueryVariables>;