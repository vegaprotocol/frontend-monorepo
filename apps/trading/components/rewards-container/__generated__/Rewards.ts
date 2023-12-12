import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RewardsPageQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type RewardsPageQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, vestingStats?: { __typename?: 'PartyVestingStats', rewardBonusMultiplier: string } | null, activityStreak?: { __typename?: 'PartyActivityStreak', rewardVestingMultiplier: string, rewardDistributionMultiplier: string, activeFor: number, isActive: boolean, inactiveFor: number, epoch: number, tradedVolume: string, openVolume: string } | null, vestingBalancesSummary: { __typename?: 'PartyVestingBalancesSummary', epoch?: number | null, vestingBalances?: Array<{ __typename?: 'PartyVestingBalance', balance: string, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, quantum: string } }> | null, lockedBalances?: Array<{ __typename?: 'PartyLockedBalance', balance: string, untilEpoch: number, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, quantum: string } }> | null } } | null };

export type ActiveRewardsQueryVariables = Types.Exact<{
  isReward?: Types.InputMaybe<Types.Scalars['Boolean']>;
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  direction?: Types.InputMaybe<Types.TransferDirection>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type ActiveRewardsQuery = { __typename?: 'Query', transfersConnection?: { __typename?: 'TransferConnection', edges?: Array<{ __typename?: 'TransferEdge', node: { __typename?: 'TransferNode', transfer: { __typename?: 'Transfer', amount: string, id: string, from: string, fromAccountType: Types.AccountType, to: string, toAccountType: Types.AccountType, reference?: string | null, status: Types.TransferStatus, timestamp: any, reason?: string | null, asset?: { __typename?: 'Asset', id: string, symbol: string, decimals: number, name: string, quantum: string, status: Types.AssetStatus } | null, kind: { __typename?: 'OneOffGovernanceTransfer' } | { __typename?: 'OneOffTransfer' } | { __typename?: 'RecurringGovernanceTransfer' } | { __typename?: 'RecurringTransfer', startEpoch: number, endEpoch?: number | null, dispatchStrategy?: { __typename?: 'DispatchStrategy', dispatchMetric: Types.DispatchMetric, dispatchMetricAssetId: string, marketIdsInScope?: Array<string> | null, entityScope: Types.EntityScope, individualScope?: Types.IndividualScope | null, teamScope?: Array<string | null> | null, nTopPerformers?: string | null, stakingRequirement: string, notionalTimeWeightedAveragePositionRequirement: string, windowLength: number, lockPeriod: number, distributionStrategy: Types.DistributionStrategy, rankTable?: Array<{ __typename?: 'RankTable', startRank: number, shareRatio: number } | null> | null } | null } }, fees?: Array<{ __typename?: 'TransferFee', transferId: string, amount: string, epoch: number } | null> | null } } | null> | null } | null };

export type ActivityStreakQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ActivityStreakQuery = { __typename?: 'Query', partiesConnection?: { __typename?: 'PartyConnection', edges: Array<{ __typename?: 'PartyEdge', node: { __typename?: 'Party', id: string, activityStreak?: { __typename?: 'PartyActivityStreak', activeFor: number, isActive: boolean, inactiveFor: number, rewardDistributionMultiplier: string, rewardVestingMultiplier: string, epoch: number, tradedVolume: string, openVolume: string } | null } }> } | null };

export type RewardsHistoryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  epochRewardSummariesPagination?: Types.InputMaybe<Types.Pagination>;
  partyRewardsPagination?: Types.InputMaybe<Types.Pagination>;
  fromEpoch?: Types.InputMaybe<Types.Scalars['Int']>;
  toEpoch?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type RewardsHistoryQuery = { __typename?: 'Query', epochRewardSummaries?: { __typename?: 'EpochRewardSummaryConnection', edges?: Array<{ __typename?: 'EpochRewardSummaryEdge', node: { __typename?: 'EpochRewardSummary', epoch: number, assetId: string, amount: string, rewardType: Types.AccountType } } | null> | null } | null, party?: { __typename?: 'Party', id: string, rewardsConnection?: { __typename?: 'RewardsConnection', edges?: Array<{ __typename?: 'RewardEdge', node: { __typename?: 'Reward', amount: string, percentageOfTotal: string, receivedAt: any, rewardType: Types.AccountType, asset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number }, party: { __typename?: 'Party', id: string }, epoch: { __typename?: 'Epoch', id: string } } } | null> | null } | null } | null };

export type RewardsEpochQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type RewardsEpochQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string } };


export const RewardsPageDocument = gql`
    query RewardsPage($partyId: ID!) {
  party(id: $partyId) {
    id
    vestingStats {
      rewardBonusMultiplier
    }
    activityStreak {
      rewardVestingMultiplier
      rewardDistributionMultiplier
      activeFor
      isActive
      inactiveFor
      epoch
      tradedVolume
      openVolume
    }
    vestingBalancesSummary {
      epoch
      vestingBalances {
        asset {
          id
          symbol
          decimals
          quantum
        }
        balance
      }
      lockedBalances {
        asset {
          id
          symbol
          decimals
          quantum
        }
        balance
        untilEpoch
      }
    }
  }
}
    `;

/**
 * __useRewardsPageQuery__
 *
 * To run a query within a React component, call `useRewardsPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewardsPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewardsPageQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useRewardsPageQuery(baseOptions: Apollo.QueryHookOptions<RewardsPageQuery, RewardsPageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RewardsPageQuery, RewardsPageQueryVariables>(RewardsPageDocument, options);
      }
export function useRewardsPageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RewardsPageQuery, RewardsPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RewardsPageQuery, RewardsPageQueryVariables>(RewardsPageDocument, options);
        }
export type RewardsPageQueryHookResult = ReturnType<typeof useRewardsPageQuery>;
export type RewardsPageLazyQueryHookResult = ReturnType<typeof useRewardsPageLazyQuery>;
export type RewardsPageQueryResult = Apollo.QueryResult<RewardsPageQuery, RewardsPageQueryVariables>;
export const ActiveRewardsDocument = gql`
    query ActiveRewards($isReward: Boolean, $partyId: ID, $direction: TransferDirection, $pagination: Pagination) {
  transfersConnection(
    partyId: $partyId
    isReward: $isReward
    direction: $direction
    pagination: $pagination
  ) {
    edges {
      node {
        transfer {
          amount
          id
          from
          fromAccountType
          to
          toAccountType
          asset {
            id
            symbol
            decimals
            name
            quantum
            status
          }
          reference
          status
          timestamp
          kind {
            ... on RecurringTransfer {
              startEpoch
              endEpoch
              dispatchStrategy {
                dispatchMetric
                dispatchMetricAssetId
                marketIdsInScope
                entityScope
                individualScope
                teamScope
                nTopPerformers
                stakingRequirement
                notionalTimeWeightedAveragePositionRequirement
                windowLength
                lockPeriod
                distributionStrategy
                rankTable {
                  startRank
                  shareRatio
                }
              }
            }
          }
          reason
        }
        fees {
          transferId
          amount
          epoch
        }
      }
    }
  }
}
    `;

/**
 * __useActiveRewardsQuery__
 *
 * To run a query within a React component, call `useActiveRewardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveRewardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveRewardsQuery({
 *   variables: {
 *      isReward: // value for 'isReward'
 *      partyId: // value for 'partyId'
 *      direction: // value for 'direction'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useActiveRewardsQuery(baseOptions?: Apollo.QueryHookOptions<ActiveRewardsQuery, ActiveRewardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActiveRewardsQuery, ActiveRewardsQueryVariables>(ActiveRewardsDocument, options);
      }
export function useActiveRewardsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActiveRewardsQuery, ActiveRewardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActiveRewardsQuery, ActiveRewardsQueryVariables>(ActiveRewardsDocument, options);
        }
export type ActiveRewardsQueryHookResult = ReturnType<typeof useActiveRewardsQuery>;
export type ActiveRewardsLazyQueryHookResult = ReturnType<typeof useActiveRewardsLazyQuery>;
export type ActiveRewardsQueryResult = Apollo.QueryResult<ActiveRewardsQuery, ActiveRewardsQueryVariables>;
export const ActivityStreakDocument = gql`
    query ActivityStreak($partyId: ID!) {
  partiesConnection(id: $partyId) {
    edges {
      node {
        id
        activityStreak {
          activeFor
          isActive
          inactiveFor
          rewardDistributionMultiplier
          rewardVestingMultiplier
          epoch
          tradedVolume
          openVolume
        }
      }
    }
  }
}
    `;

/**
 * __useActivityStreakQuery__
 *
 * To run a query within a React component, call `useActivityStreakQuery` and pass it any options that fit your needs.
 * When your component renders, `useActivityStreakQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActivityStreakQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useActivityStreakQuery(baseOptions: Apollo.QueryHookOptions<ActivityStreakQuery, ActivityStreakQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActivityStreakQuery, ActivityStreakQueryVariables>(ActivityStreakDocument, options);
      }
export function useActivityStreakLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActivityStreakQuery, ActivityStreakQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActivityStreakQuery, ActivityStreakQueryVariables>(ActivityStreakDocument, options);
        }
export type ActivityStreakQueryHookResult = ReturnType<typeof useActivityStreakQuery>;
export type ActivityStreakLazyQueryHookResult = ReturnType<typeof useActivityStreakLazyQuery>;
export type ActivityStreakQueryResult = Apollo.QueryResult<ActivityStreakQuery, ActivityStreakQueryVariables>;
export const RewardsHistoryDocument = gql`
    query RewardsHistory($partyId: ID!, $epochRewardSummariesPagination: Pagination, $partyRewardsPagination: Pagination, $fromEpoch: Int, $toEpoch: Int) {
  epochRewardSummaries(
    filter: {fromEpoch: $fromEpoch, toEpoch: $toEpoch}
    pagination: $epochRewardSummariesPagination
  ) {
    edges {
      node {
        epoch
        assetId
        amount
        rewardType
      }
    }
  }
  party(id: $partyId) {
    id
    rewardsConnection(
      fromEpoch: $fromEpoch
      toEpoch: $toEpoch
      pagination: $partyRewardsPagination
    ) {
      edges {
        node {
          amount
          percentageOfTotal
          receivedAt
          rewardType
          asset {
            id
            symbol
            name
            decimals
          }
          party {
            id
          }
          epoch {
            id
          }
        }
      }
    }
  }
}
    `;

/**
 * __useRewardsHistoryQuery__
 *
 * To run a query within a React component, call `useRewardsHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewardsHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewardsHistoryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      epochRewardSummariesPagination: // value for 'epochRewardSummariesPagination'
 *      partyRewardsPagination: // value for 'partyRewardsPagination'
 *      fromEpoch: // value for 'fromEpoch'
 *      toEpoch: // value for 'toEpoch'
 *   },
 * });
 */
export function useRewardsHistoryQuery(baseOptions: Apollo.QueryHookOptions<RewardsHistoryQuery, RewardsHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RewardsHistoryQuery, RewardsHistoryQueryVariables>(RewardsHistoryDocument, options);
      }
export function useRewardsHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RewardsHistoryQuery, RewardsHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RewardsHistoryQuery, RewardsHistoryQueryVariables>(RewardsHistoryDocument, options);
        }
export type RewardsHistoryQueryHookResult = ReturnType<typeof useRewardsHistoryQuery>;
export type RewardsHistoryLazyQueryHookResult = ReturnType<typeof useRewardsHistoryLazyQuery>;
export type RewardsHistoryQueryResult = Apollo.QueryResult<RewardsHistoryQuery, RewardsHistoryQueryVariables>;
export const RewardsEpochDocument = gql`
    query RewardsEpoch {
  epoch {
    id
  }
}
    `;

/**
 * __useRewardsEpochQuery__
 *
 * To run a query within a React component, call `useRewardsEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewardsEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewardsEpochQuery({
 *   variables: {
 *   },
 * });
 */
export function useRewardsEpochQuery(baseOptions?: Apollo.QueryHookOptions<RewardsEpochQuery, RewardsEpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RewardsEpochQuery, RewardsEpochQueryVariables>(RewardsEpochDocument, options);
      }
export function useRewardsEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RewardsEpochQuery, RewardsEpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RewardsEpochQuery, RewardsEpochQueryVariables>(RewardsEpochDocument, options);
        }
export type RewardsEpochQueryHookResult = ReturnType<typeof useRewardsEpochQuery>;
export type RewardsEpochLazyQueryHookResult = ReturnType<typeof useRewardsEpochLazyQuery>;
export type RewardsEpochQueryResult = Apollo.QueryResult<RewardsEpochQuery, RewardsEpochQueryVariables>;