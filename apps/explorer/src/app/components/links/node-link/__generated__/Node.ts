import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerNodeQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type ExplorerNodeQuery = { __typename: 'Query', node?: { __typename: 'Node', id: string, name: string, status: Types.NodeStatus } | null };


export const ExplorerNodeDocument = gql`
    query ExplorerNode($id: ID!) {
  node(id: $id) {
    id
    name
    status
  }
}
    `;

/**
 * __useExplorerNodeQuery__
 *
 * To run a query within a React component, call `useExplorerNodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerNodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerNodeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExplorerNodeQuery(baseOptions: Apollo.QueryHookOptions<ExplorerNodeQuery, ExplorerNodeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerNodeQuery, ExplorerNodeQueryVariables>(ExplorerNodeDocument, options);
      }
export function useExplorerNodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerNodeQuery, ExplorerNodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerNodeQuery, ExplorerNodeQueryVariables>(ExplorerNodeDocument, options);
        }
export type ExplorerNodeQueryHookResult = ReturnType<typeof useExplorerNodeQuery>;
export type ExplorerNodeLazyQueryHookResult = ReturnType<typeof useExplorerNodeLazyQuery>;
export type ExplorerNodeQueryResult = Apollo.QueryResult<ExplorerNodeQuery, ExplorerNodeQueryVariables>;