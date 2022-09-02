import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NodesQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NodesQueryQuery = { __typename?: 'Query', nodes?: Array<{ __typename?: 'Node', id: string, name: string, infoUrl: string, avatarUrl?: string | null, pubkey: string, tmPubkey: string, ethereumAddress: string, location: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, status: Types.NodeStatus, epochData?: { __typename?: 'EpochData', total: number, offline: number, online: number } | null }> | null };


export const NodesQueryDocument = gql`
    query NodesQuery {
  nodes {
    id
    name
    infoUrl
    avatarUrl
    pubkey
    tmPubkey
    ethereumAddress
    location
    stakedByOperator
    stakedByDelegates
    stakedTotal
    pendingStake
    epochData {
      total
      offline
      online
    }
    status
    name
  }
}
    `;

/**
 * __useNodesQueryQuery__
 *
 * To run a query within a React component, call `useNodesQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useNodesQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodesQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useNodesQueryQuery(baseOptions?: Apollo.QueryHookOptions<NodesQueryQuery, NodesQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NodesQueryQuery, NodesQueryQueryVariables>(NodesQueryDocument, options);
      }
export function useNodesQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NodesQueryQuery, NodesQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NodesQueryQuery, NodesQueryQueryVariables>(NodesQueryDocument, options);
        }
export type NodesQueryQueryHookResult = ReturnType<typeof useNodesQueryQuery>;
export type NodesQueryLazyQueryHookResult = ReturnType<typeof useNodesQueryLazyQuery>;
export type NodesQueryQueryResult = Apollo.QueryResult<NodesQueryQuery, NodesQueryQueryVariables>;