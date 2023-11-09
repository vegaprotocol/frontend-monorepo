import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RewardsPageQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type RewardsPageQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, vestingBalancesSummary: { __typename?: 'PartyVestingBalancesSummary', epoch?: number | null, vestingBalances?: Array<{ __typename?: 'PartyVestingBalance', balance: string, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, quantum: string } }> | null, lockedBalances?: Array<{ __typename?: 'PartyLockedBalance', balance: string, untilEpoch: number, asset: { __typename?: 'Asset', id: string, symbol: string, decimals: number, quantum: string } }> | null } } | null };

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