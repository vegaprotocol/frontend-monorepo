import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StakingNodeFieldsFragment = { __typename: 'Node', id: string, name: string, pubkey: string, infoUrl: string, location: string, ethereumAddress: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, epochData?: { __typename: 'EpochData', total: number, offline: number, online: number } | null, rankingScore: { __typename: 'RankingScore', rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string, status: Types.ValidatorStatus } };

export type StakingDelegationFieldsFragment = { __typename: 'Delegation', amount: string, epoch: number, node: { __typename: 'Node', id: string }, party: { __typename: 'Party', id: string } };

export type StakingQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  delegationsPagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type StakingQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, stakingSummary: { __typename: 'StakingSummary', currentStakeAvailable: string }, delegationsConnection?: { __typename: 'DelegationsConnection', edges?: Array<{ __typename: 'DelegationEdge', node: { __typename: 'Delegation', amount: string, epoch: number, node: { __typename: 'Node', id: string }, party: { __typename: 'Party', id: string } } } | null> | null } | null } | null, epoch: { __typename: 'Epoch', id: string, timestamps: { __typename: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } }, nodesConnection: { __typename: 'NodesConnection', edges?: Array<{ __typename: 'NodeEdge', node: { __typename: 'Node', id: string, name: string, pubkey: string, infoUrl: string, location: string, ethereumAddress: string, stakedByOperator: string, stakedByDelegates: string, stakedTotal: string, pendingStake: string, epochData?: { __typename: 'EpochData', total: number, offline: number, online: number } | null, rankingScore: { __typename: 'RankingScore', rankingScore: string, stakeScore: string, performanceScore: string, votingPower: string, status: Types.ValidatorStatus } } } | null> | null }, nodeData?: { __typename: 'NodeData', stakedTotal: string, totalNodes: number, inactiveNodes: number, uptime: number } | null };

export const StakingNodeFieldsFragmentDoc = gql`
    fragment StakingNodeFields on Node {
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
  epochData {
    total
    offline
    online
  }
  rankingScore {
    rankingScore
    stakeScore
    performanceScore
    votingPower
    status
  }
}
    `;
export const StakingDelegationFieldsFragmentDoc = gql`
    fragment StakingDelegationFields on Delegation {
  amount
  epoch
  node {
    id
  }
  party {
    id
  }
}
    `;
export const StakingDocument = gql`
    query Staking($partyId: ID!, $delegationsPagination: Pagination) {
  party(id: $partyId) {
    id
    stakingSummary {
      currentStakeAvailable
    }
    delegationsConnection(pagination: $delegationsPagination) {
      edges {
        node {
          ...StakingDelegationFields
        }
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
  nodesConnection {
    edges {
      node {
        ...StakingNodeFields
      }
    }
  }
  nodeData {
    stakedTotal
    totalNodes
    inactiveNodes
    uptime
  }
}
    ${StakingDelegationFieldsFragmentDoc}
${StakingNodeFieldsFragmentDoc}`;

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
 *      delegationsPagination: // value for 'delegationsPagination'
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