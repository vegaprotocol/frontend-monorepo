import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferralProgramQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ReferralProgramQuery = { __typename?: 'Query', currentReferralProgram?: { __typename?: 'CurrentReferralProgram', id: string, version: number, endOfProgramTimestamp: any, windowLength: number, endedAt?: any | null, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | null };


export const ReferralProgramDocument = gql`
    query ReferralProgram {
  currentReferralProgram {
    id
    version
    endOfProgramTimestamp
    windowLength
    endedAt
    benefitTiers {
      minimumEpochs
      minimumRunningNotionalTakerVolume
      referralDiscountFactor
      referralRewardFactor
    }
    stakingTiers {
      minimumStakedTokens
      referralRewardMultiplier
    }
  }
}
    `;

/**
 * __useReferralProgramQuery__
 *
 * To run a query within a React component, call `useReferralProgramQuery` and pass it any options that fit your needs.
 * When your component renders, `useReferralProgramQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReferralProgramQuery({
 *   variables: {
 *   },
 * });
 */
export function useReferralProgramQuery(baseOptions?: Apollo.QueryHookOptions<ReferralProgramQuery, ReferralProgramQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReferralProgramQuery, ReferralProgramQueryVariables>(ReferralProgramDocument, options);
      }
export function useReferralProgramLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReferralProgramQuery, ReferralProgramQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReferralProgramQuery, ReferralProgramQueryVariables>(ReferralProgramDocument, options);
        }
export type ReferralProgramQueryHookResult = ReturnType<typeof useReferralProgramQuery>;
export type ReferralProgramLazyQueryHookResult = ReturnType<typeof useReferralProgramLazyQuery>;
export type ReferralProgramQueryResult = Apollo.QueryResult<ReferralProgramQuery, ReferralProgramQueryVariables>;