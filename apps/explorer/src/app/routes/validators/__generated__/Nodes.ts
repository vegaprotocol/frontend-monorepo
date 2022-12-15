import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerNodesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerNodesQuery = { __typename?: 'Query', nodesConnection: { __typename?: 'NodesConnection', edges?: Array<{ __typename?: 'NodeEdge', node: { __typename?: 'Node', id: string, name: string, infoUrl: string, avatarUrl?: string | null, pubkey: string, tmPubkey: string, ethereumAddress: string, location: string, status: Types.NodeStatus, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, epochData?: { __typename?: 'EpochData', total: number, offline: number, online: number } | null } } | null> | null } };


export const ExplorerNodesDocument = gql`
    query ExplorerNodes {
  nodesConnection {
    edges {
      node {
        id
        name
        infoUrl
        avatarUrl
        pubkey
        tmPubkey
        ethereumAddress
        location
        status
        stakedByOperator
        stakedByDelegates
        stakedTotal
        pendingStake
        epochData {
          total
          offline
          online
        }
      }
    }
  }
}
    `;

/**
 * __useExplorerNodesQuery__
 *
 * To run a query within a React component, call `useExplorerNodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerNodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerNodesQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerNodesQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerNodesQuery, ExplorerNodesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerNodesQuery, ExplorerNodesQueryVariables>(ExplorerNodesDocument, options);
      }
export function useExplorerNodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerNodesQuery, ExplorerNodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerNodesQuery, ExplorerNodesQueryVariables>(ExplorerNodesDocument, options);
        }
export type ExplorerNodesQueryHookResult = ReturnType<typeof useExplorerNodesQuery>;
export type ExplorerNodesLazyQueryHookResult = ReturnType<typeof useExplorerNodesLazyQuery>;
export type ExplorerNodesQueryResult = Apollo.QueryResult<ExplorerNodesQuery, ExplorerNodesQueryVariables>;