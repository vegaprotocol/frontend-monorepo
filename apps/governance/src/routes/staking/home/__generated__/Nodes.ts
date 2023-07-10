import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NodesFragmentFragment = { __typename: 'Node', avatarUrl?: string | null, id: string, name: string, pubkey: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, rankingScore: { __typename: 'RankingScore', rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string, status: Types.ValidatorStatus } };

export type NodesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NodesQuery = { __typename: 'Query', epoch: { __typename: 'Epoch', id: string, timestamps: { __typename: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } }, nodesConnection: { __typename: 'NodesConnection', edges?: Array<{ __typename: 'NodeEdge', node: { __typename: 'Node', avatarUrl?: string | null, id: string, name: string, pubkey: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, rankingScore: { __typename: 'RankingScore', rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string, status: Types.ValidatorStatus } } } | null> | null }, nodeData?: { __typename: 'NodeData', stakedTotal: string } | null };

export const NodesFragmentFragmentDoc = gql`
    fragment NodesFragment on Node {
  avatarUrl
  id
  name
  pubkey
  stakedByOperator
  stakedByDelegates
  stakedTotal
  pendingStake
  rankingScore {
    rankingScore
    stakeScore
    performanceScore
    votingPower
    status
  }
}
    `;
export const NodesDocument = gql`
    query Nodes {
  epoch {
    id
    timestamps {
      start
      end
      expiry
    }
  }
  nodesConnection {
    edges {
      node {
        ...NodesFragment
      }
    }
  }
  nodeData {
    stakedTotal
  }
}
    ${NodesFragmentFragmentDoc}`;

/**
 * __useNodesQuery__
 *
 * To run a query within a React component, call `useNodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useNodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNodesQuery({
 *   variables: {
 *   },
 * });
 */
export function useNodesQuery(baseOptions?: Apollo.QueryHookOptions<NodesQuery, NodesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NodesQuery, NodesQueryVariables>(NodesDocument, options);
      }
export function useNodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NodesQuery, NodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NodesQuery, NodesQueryVariables>(NodesDocument, options);
        }
export type NodesQueryHookResult = ReturnType<typeof useNodesQuery>;
export type NodesLazyQueryHookResult = ReturnType<typeof useNodesLazyQuery>;
export type NodesQueryResult = Apollo.QueryResult<NodesQuery, NodesQueryVariables>;