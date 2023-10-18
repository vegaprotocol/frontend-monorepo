import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DiscountProgramsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DiscountProgramsQuery = { __typename?: 'Query', currentReferralProgram?: { __typename?: 'CurrentReferralProgram', windowLength: number, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string }> } | null, currentVolumeDiscountProgram?: { __typename?: 'VolumeDiscountProgram', windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } | null };

export type FeesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  volumeDiscountEpochs: Types.Scalars['Int'];
  referralDiscountEpochs: Types.Scalars['Int'];
}>;


export type FeesQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string }, volumeDiscountStats: { __typename?: 'VolumeDiscountStatsConnection', edges: Array<{ __typename?: 'VolumeDiscountStatsEdge', node: { __typename?: 'VolumeDiscountStats', atEpoch: number, discountFactor: string, runningVolume: string } } | null> }, referralSetReferees: { __typename?: 'ReferralSetRefereeConnection', edges: Array<{ __typename?: 'ReferralSetRefereeEdge', node: { __typename?: 'ReferralSetReferee', atEpoch: number } } | null> }, referralSetStats: { __typename?: 'ReferralSetStatsConnection', edges: Array<{ __typename?: 'ReferralSetStatsEdge', node: { __typename?: 'ReferralSetStats', atEpoch: number, discountFactor: string, referralSetRunningNotionalTakerVolume: string } } | null> } };


export const DiscountProgramsDocument = gql`
    query DiscountPrograms {
  currentReferralProgram {
    benefitTiers {
      minimumEpochs
      minimumRunningNotionalTakerVolume
      referralDiscountFactor
    }
    windowLength
  }
  currentVolumeDiscountProgram {
    benefitTiers {
      minimumRunningNotionalTakerVolume
      volumeDiscountFactor
    }
    windowLength
  }
}
    `;

/**
 * __useDiscountProgramsQuery__
 *
 * To run a query within a React component, call `useDiscountProgramsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscountProgramsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscountProgramsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDiscountProgramsQuery(baseOptions?: Apollo.QueryHookOptions<DiscountProgramsQuery, DiscountProgramsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscountProgramsQuery, DiscountProgramsQueryVariables>(DiscountProgramsDocument, options);
      }
export function useDiscountProgramsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscountProgramsQuery, DiscountProgramsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscountProgramsQuery, DiscountProgramsQueryVariables>(DiscountProgramsDocument, options);
        }
export type DiscountProgramsQueryHookResult = ReturnType<typeof useDiscountProgramsQuery>;
export type DiscountProgramsLazyQueryHookResult = ReturnType<typeof useDiscountProgramsLazyQuery>;
export type DiscountProgramsQueryResult = Apollo.QueryResult<DiscountProgramsQuery, DiscountProgramsQueryVariables>;
export const FeesDocument = gql`
    query Fees($partyId: ID!, $volumeDiscountEpochs: Int!, $referralDiscountEpochs: Int!) {
  epoch {
    id
  }
  volumeDiscountStats(
    partyId: $partyId
    pagination: {last: $volumeDiscountEpochs}
  ) {
    edges {
      node {
        atEpoch
        discountFactor
        runningVolume
      }
    }
  }
  referralSetReferees(referee: $partyId) {
    edges {
      node {
        atEpoch
      }
    }
  }
  referralSetStats(partyId: $partyId, pagination: {last: $referralDiscountEpochs}) {
    edges {
      node {
        atEpoch
        discountFactor
        referralSetRunningNotionalTakerVolume
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
 *      volumeDiscountEpochs: // value for 'volumeDiscountEpochs'
 *      referralDiscountEpochs: // value for 'referralDiscountEpochs'
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