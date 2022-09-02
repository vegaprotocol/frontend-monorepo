import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StakingQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type StakingQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, stake: { __typename?: 'PartyStake', currentStakeAvailable: string, currentStakeAvailableFormatted: string }, delegations?: Array<{ __typename?: 'Delegation', amount: string, amountFormatted: string, epoch: number, node: { __typename?: 'Node', id: string } }> | null } | null, epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: string | null, end?: string | null, expiry?: string | null } }, nodes?: Array<{ __typename?: 'Node', id: string, name: string, pubkey: string, infoUrl: string, location: string, ethereumAddress: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, stakedByOperatorFormatted: string, stakedByDelegatesFormatted: string, stakedTotalFormatted: string, pendingStakeFormatted: string, status: Types.NodeStatus, epochData?: { __typename?: 'EpochData', total: number, offline: number, online: number } | null, rankingScore: { __typename?: 'RankingScore', rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string } }> | null, nodeData?: { __typename?: 'NodeData', stakedTotal: string, stakedTotalFormatted: string, totalNodes: number, inactiveNodes: number, validatingNodes: number, uptime: number } | null };


export const StakingDocument = gql`
    query Staking($partyId: ID!) {
  party(id: $partyId) {
    id
    stake {
      currentStakeAvailable
      currentStakeAvailableFormatted @client
    }
    delegations {
      amount
      amountFormatted @client
      epoch
      node {
        id
      }
    }
  }
  epoch {
    id
    timestamps {
      start
      end
      expiry
    }
  }
  nodes {
    id
    name
    pubkey
    infoUrl
    location
    ethereumAddress
    stakedByOperator
    stakedByDelegates
    stakedTotal
    pendingStake
    stakedByOperatorFormatted @client
    stakedByDelegatesFormatted @client
    stakedTotalFormatted @client
    pendingStakeFormatted @client
    epochData {
      total
      offline
      online
    }
    status
    rankingScore {
      rankingScore
      stakeScore
      performanceScore
      votingPower
      stakeScore
    }
  }
  nodeData {
    stakedTotal
    stakedTotalFormatted @client
    totalNodes
    inactiveNodes
    validatingNodes
    uptime
  }
}
    `;

/**
 * __useStakingQuery__
 *
 * To run a query within a React component, call `useStakingQuery` and pass it any options that fit your needs.
 * When your component renders, `useStakingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStakingQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useStakingQuery(baseOptions: Apollo.QueryHookOptions<StakingQuery, StakingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StakingQuery, StakingQueryVariables>(StakingDocument, options);
      }
export function useStakingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StakingQuery, StakingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StakingQuery, StakingQueryVariables>(StakingDocument, options);
        }
export type StakingQueryHookResult = ReturnType<typeof useStakingQuery>;
export type StakingLazyQueryHookResult = ReturnType<typeof useStakingLazyQuery>;
export type StakingQueryResult = Apollo.QueryResult<StakingQuery, StakingQueryVariables>;