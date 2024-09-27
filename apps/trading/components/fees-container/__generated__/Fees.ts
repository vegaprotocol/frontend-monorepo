import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FeesQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type FeesQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string }, volumeDiscountStats: { __typename?: 'VolumeDiscountStatsConnection', edges: Array<{ __typename?: 'VolumeDiscountStatsEdge', node: { __typename?: 'VolumeDiscountStats', atEpoch: number, runningVolume: string, discountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } } } | null> }, referrer: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string } } | null> }, referee: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string } } | null> }, referralSetReferees: { __typename?: 'ReferralSetRefereeConnection', edges: Array<{ __typename?: 'ReferralSetRefereeEdge', node: { __typename?: 'ReferralSetReferee', atEpoch: number } } | null> }, referralSetStats: { __typename?: 'ReferralSetStatsConnection', edges: Array<{ __typename?: 'ReferralSetStatsEdge', node: { __typename?: 'ReferralSetStats', atEpoch: number, referralSetRunningNotionalTakerVolume: string, discountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } } } | null> } };


export const FeesDocument = gql`
    query Fees($partyId: ID!) {
  epoch {
    id
  }
  volumeDiscountStats(partyId: $partyId, pagination: {last: 1}) {
    edges {
      node {
        atEpoch
        discountFactors {
          infrastructureFactor
          makerFactor
          liquidityFactor
        }
        runningVolume
      }
    }
  }
  referrer: referralSets(referrer: $partyId) {
    edges {
      node {
        id
        referrer
      }
    }
  }
  referee: referralSets(referee: $partyId) {
    edges {
      node {
        id
        referrer
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
  referralSetStats(partyId: $partyId, pagination: {last: 1}) {
    edges {
      node {
        atEpoch
        discountFactors {
          infrastructureFactor
          makerFactor
          liquidityFactor
        }
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