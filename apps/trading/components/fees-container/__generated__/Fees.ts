import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FeesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  volumeDiscountStatsEpochs: Types.Scalars['Int'];
}>;


export type FeesQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string }, currentReferralProgram?: { __typename?: 'CurrentReferralProgram', benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }> } | null, currentVolumeDiscountProgram?: { __typename?: 'VolumeDiscountProgram', benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } | null, volumeDiscountStats: { __typename?: 'VolumeDiscountStatsConnection', edges: Array<{ __typename?: 'VolumeDiscountStatsEdge', node: { __typename?: 'VolumeDiscountStats', atEpoch: number, discountFactor: string, runningVolume: string } } | null> }, referralSetReferees: { __typename?: 'ReferralSetRefereeConnection', edges: Array<{ __typename?: 'ReferralSetRefereeEdge', node: { __typename?: 'ReferralSetReferee', referralSetId: string, joinedAt: any, atEpoch: number, totalRefereeNotionalTakerVolume: string } } | null> }, referralSetStats: { __typename?: 'ReferralSetStatsConnection', edges: Array<{ __typename?: 'ReferralSetStatsEdge', node: { __typename?: 'ReferralSetStats', atEpoch: number, discountFactor: string } } | null> } };


export const FeesDocument = gql`
    query Fees($partyId: ID!, $volumeDiscountStatsEpochs: Int!) {
  epoch {
    id
  }
  currentReferralProgram {
    benefitTiers {
      minimumEpochs
      minimumRunningNotionalTakerVolume
      referralDiscountFactor
      referralRewardFactor
    }
  }
  currentVolumeDiscountProgram {
    benefitTiers {
      minimumRunningNotionalTakerVolume
      volumeDiscountFactor
    }
  }
  volumeDiscountStats(
    partyId: $partyId
    pagination: {last: $volumeDiscountStatsEpochs}
  ) {
    edges {
      node {
        atEpoch
        discountFactor
        runningVolume
      }
    }
  }
  referralSetReferees(referee: $partyId, aggregationDays: 7) {
    edges {
      node {
        referralSetId
        joinedAt
        atEpoch
        totalRefereeNotionalTakerVolume
      }
    }
  }
  referralSetStats(partyId: $partyId) {
    edges {
      node {
        atEpoch
        discountFactor
      }
    }
  }
}
    `;

/**
 * __useFeesQuery__
 *
 * To run a query within a React component, call `useFeesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeesQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      volumeDiscountStatsEpochs: // value for 'volumeDiscountStatsEpochs'
 *   },
 * });
 */
export function useFeesQuery(baseOptions: Apollo.QueryHookOptions<FeesQuery, FeesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeesQuery, FeesQueryVariables>(FeesDocument, options);
      }
export function useFeesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeesQuery, FeesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeesQuery, FeesQueryVariables>(FeesDocument, options);
        }
export type FeesQueryHookResult = ReturnType<typeof useFeesQuery>;
export type FeesLazyQueryHookResult = ReturnType<typeof useFeesLazyQuery>;
export type FeesQueryResult = Apollo.QueryResult<FeesQuery, FeesQueryVariables>;