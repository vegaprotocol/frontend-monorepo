import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferralSetStatsQueryVariables = Types.Exact<{
  code: Types.Scalars['ID'];
  epoch?: Types.InputMaybe<Types.Scalars['Int']>;
}>;


export type ReferralSetStatsQuery = { __typename?: 'Query', referralSetStats: { __typename?: 'ReferralSetStatsConnection', edges: Array<{ __typename?: 'ReferralSetStatsEdge', node: { __typename?: 'ReferralSetStats', atEpoch: number, partyId: string, discountFactor: string, rewardFactor: string, epochNotionalTakerVolume: string, referralSetRunningNotionalTakerVolume: string, rewardsMultiplier: string, rewardsFactorMultiplier: string, referrerTakerVolume: string } } | null> } };


export const ReferralSetStatsDocument = gql`
    query ReferralSetStats($code: ID!, $epoch: Int) {
  referralSetStats(setId: $code, epoch: $epoch) {
    edges {
      node {
        atEpoch
        partyId
        discountFactor
        rewardFactor
        epochNotionalTakerVolume
        referralSetRunningNotionalTakerVolume
        rewardsMultiplier
        rewardsFactorMultiplier
        referrerTakerVolume
      }
    }
  }
}
    `;

/**
 * __useReferralSetStatsQuery__
 *
 * To run a query within a React component, call `useReferralSetStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useReferralSetStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReferralSetStatsQuery({
 *   variables: {
 *      code: // value for 'code'
 *      epoch: // value for 'epoch'
 *   },
 * });
 */
export function useReferralSetStatsQuery(baseOptions: Apollo.QueryHookOptions<ReferralSetStatsQuery, ReferralSetStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReferralSetStatsQuery, ReferralSetStatsQueryVariables>(ReferralSetStatsDocument, options);
      }
export function useReferralSetStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReferralSetStatsQuery, ReferralSetStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReferralSetStatsQuery, ReferralSetStatsQueryVariables>(ReferralSetStatsDocument, options);
        }
export type ReferralSetStatsQueryHookResult = ReturnType<typeof useReferralSetStatsQuery>;
export type ReferralSetStatsLazyQueryHookResult = ReturnType<typeof useReferralSetStatsLazyQuery>;
export type ReferralSetStatsQueryResult = Apollo.QueryResult<ReferralSetStatsQuery, ReferralSetStatsQueryVariables>;