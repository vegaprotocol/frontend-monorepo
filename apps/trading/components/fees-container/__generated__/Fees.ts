import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FeesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type FeesQuery = { __typename?: 'Query', currentReferralProgram?: { __typename?: 'CurrentReferralProgram', benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }> } | null, currentVolumeDiscountProgram?: { __typename?: 'VolumeDiscountProgram', benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } | null };


export const FeesDocument = gql`
    query Fees {
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
 *   },
 * });
 */
export function useFeesQuery(baseOptions?: Apollo.QueryHookOptions<FeesQuery, FeesQueryVariables>) {
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