import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferralFeesStatsQueryVariables = Types.Exact<{
  marketId?: Types.InputMaybe<Types.Scalars['ID']>;
  assetId?: Types.InputMaybe<Types.Scalars['ID']>;
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  epoch?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type ReferralFeesStatsQuery = { __typename?: 'Query', feesStats?: { __typename?: 'FeesStats', marketId: string, assetId: string, epoch: number, totalRewardsPaid: Array<{ __typename?: 'PartyAmount', partyId: string, amount: string }>, referrerRewardsGenerated: Array<{ __typename?: 'ReferrerRewardsGenerated', referrerId: string, generatedReward: Array<{ __typename?: 'PartyAmount', partyId: string, amount: string }> }>, refereesDiscountApplied: Array<{ __typename?: 'PartyAmount', partyId: string, amount: string }> } | null };


export const ReferralFeesStatsDocument = gql`
    query ReferralFeesStats($marketId: ID, $assetId: ID, $partyId: ID, $epoch: Int) {
  feesStats(
    marketId: $marketId
    assetId: $assetId
    partyId: $partyId
    epoch: $epoch
  ) {
    marketId
    assetId
    epoch
    totalRewardsPaid {
      partyId
      amount
    }
    referrerRewardsGenerated {
      referrerId
      generatedReward {
        partyId
        amount
      }
    }
    refereesDiscountApplied {
      partyId
      amount
    }
  }
}
    `;

/**
 * __useReferralFeesStatsQuery__
 *
 * To run a query within a React component, call `useReferralFeesStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useReferralFeesStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReferralFeesStatsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      assetId: // value for 'assetId'
 *      partyId: // value for 'partyId'
 *      epoch: // value for 'epoch'
 *   },
 * });
 */
export function useReferralFeesStatsQuery(baseOptions?: Apollo.QueryHookOptions<ReferralFeesStatsQuery, ReferralFeesStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReferralFeesStatsQuery, ReferralFeesStatsQueryVariables>(ReferralFeesStatsDocument, options);
      }
export function useReferralFeesStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReferralFeesStatsQuery, ReferralFeesStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReferralFeesStatsQuery, ReferralFeesStatsQueryVariables>(ReferralFeesStatsDocument, options);
        }
export type ReferralFeesStatsQueryHookResult = ReturnType<typeof useReferralFeesStatsQuery>;
export type ReferralFeesStatsLazyQueryHookResult = ReturnType<typeof useReferralFeesStatsLazyQuery>;
export type ReferralFeesStatsQueryResult = Apollo.QueryResult<ReferralFeesStatsQuery, ReferralFeesStatsQueryVariables>;