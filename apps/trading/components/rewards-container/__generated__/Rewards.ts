import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RewardsPageQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  epochRewardSummariesFilter?: Types.InputMaybe<Types.RewardSummaryFilter>;
  epochRewardSummariesPagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type RewardsPageQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, activityStreak?: { __typename?: 'PartyActivityStreak', isActive: boolean, activeFor: number, inactiveFor: number, rewardDistributionMultiplier: string, rewardVestingMultiplier: string, epoch: number, tradedVolume: string, openVolume: string } | null, vestingBalancesSummary: { __typename?: 'PartyVestingBalancesSummary', epoch?: number | null, vestingBalances?: Array<{ __typename?: 'PartyVestingBalance', balance: string, asset: { __typename?: 'Asset', id: string, symbol: string } }> | null, lockedBalances?: Array<{ __typename?: 'PartyLockedBalance', balance: string, untilEpoch: number, asset: { __typename?: 'Asset', id: string, symbol: string } }> | null } } | null, epochRewardSummaries?: { __typename?: 'EpochRewardSummaryConnection', edges?: Array<{ __typename?: 'EpochRewardSummaryEdge', node: { __typename?: 'EpochRewardSummary', epoch: number, assetId: string, amount: string, rewardType: Types.AccountType } } | null> | null } | null };

export type RewardsPageEpochQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type RewardsPageEpochQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string } };


export const RewardsPageDocument = gql`
    query RewardsPage($partyId: ID!, $epochRewardSummariesFilter: RewardSummaryFilter, $epochRewardSummariesPagination: Pagination) {
  party(id: $partyId) {
    id
    activityStreak {
      isActive
      activeFor
      inactiveFor
      rewardDistributionMultiplier
      rewardVestingMultiplier
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
        }
        balance
      }
      lockedBalances {
        asset {
          id
          symbol
        }
        balance
        untilEpoch
      }
    }
  }
  epochRewardSummaries(
    filter: $epochRewardSummariesFilter
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
 *      epochRewardSummariesFilter: // value for 'epochRewardSummariesFilter'
 *      epochRewardSummariesPagination: // value for 'epochRewardSummariesPagination'
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
export const RewardsPageEpochDocument = gql`
    query RewardsPageEpoch {
  epoch {
    id
  }
}
    `;

/**
 * __useRewardsPageEpochQuery__
 *
 * To run a query within a React component, call `useRewardsPageEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewardsPageEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewardsPageEpochQuery({
 *   variables: {
 *   },
 * });
 */
export function useRewardsPageEpochQuery(baseOptions?: Apollo.QueryHookOptions<RewardsPageEpochQuery, RewardsPageEpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RewardsPageEpochQuery, RewardsPageEpochQueryVariables>(RewardsPageEpochDocument, options);
      }
export function useRewardsPageEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RewardsPageEpochQuery, RewardsPageEpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RewardsPageEpochQuery, RewardsPageEpochQueryVariables>(RewardsPageEpochDocument, options);
        }
export type RewardsPageEpochQueryHookResult = ReturnType<typeof useRewardsPageEpochQuery>;
export type RewardsPageEpochLazyQueryHookResult = ReturnType<typeof useRewardsPageEpochLazyQuery>;
export type RewardsPageEpochQueryResult = Apollo.QueryResult<RewardsPageEpochQuery, RewardsPageEpochQueryVariables>;