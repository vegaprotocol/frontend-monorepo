import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ReferralProgramFieldsFragment = { __typename?: 'CurrentReferralProgram', id: string, version: number, endOfProgramTimestamp: any, windowLength: number, endedAt?: any | null, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string }, referralRewardFactors: { __typename?: 'RewardFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> };

export type VolumeDiscountFieldsFragment = { __typename?: 'VolumeDiscountProgram', id: string, version: number, endOfProgramTimestamp: any, windowLength: number, endedAt?: any | null, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } }> };

export type CurrentProgramsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentProgramsQuery = { __typename?: 'Query', currentReferralProgram?: { __typename?: 'CurrentReferralProgram', id: string, version: number, endOfProgramTimestamp: any, windowLength: number, endedAt?: any | null, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string }, referralRewardFactors: { __typename?: 'RewardFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | null, currentVolumeDiscountProgram?: { __typename?: 'VolumeDiscountProgram', id: string, version: number, endOfProgramTimestamp: any, windowLength: number, endedAt?: any | null, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactors: { __typename?: 'DiscountFactors', infrastructureFactor: string, makerFactor: string, liquidityFactor: string } }> } | null, defaultBuybackFee?: { __typename?: 'NetworkParameter', value: string } | null, defaultInfrastructureFee?: { __typename?: 'NetworkParameter', value: string } | null, defaultMakerFee?: { __typename?: 'NetworkParameter', value: string } | null, defaultTreasuryFee?: { __typename?: 'NetworkParameter', value: string } | null, feesPerMarket?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', state: Types.MarketState, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string, buyBackFee: string, treasuryFee: string } } } }> } | null };

export const ReferralProgramFieldsFragmentDoc = gql`
    fragment ReferralProgramFields on CurrentReferralProgram {
  id
  version
  endOfProgramTimestamp
  windowLength
  endedAt
  benefitTiers {
    minimumEpochs
    minimumRunningNotionalTakerVolume
    referralDiscountFactors {
      infrastructureFactor
      makerFactor
      liquidityFactor
    }
    referralRewardFactors {
      infrastructureFactor
      makerFactor
      liquidityFactor
    }
  }
  stakingTiers {
    minimumStakedTokens
    referralRewardMultiplier
  }
}
    `;
export const VolumeDiscountFieldsFragmentDoc = gql`
    fragment VolumeDiscountFields on VolumeDiscountProgram {
  id
  version
  endOfProgramTimestamp
  windowLength
  endedAt
  benefitTiers {
    minimumRunningNotionalTakerVolume
    volumeDiscountFactors {
      infrastructureFactor
      makerFactor
      liquidityFactor
    }
  }
  windowLength
}
    `;
export const CurrentProgramsDocument = gql`
    query CurrentPrograms {
  currentReferralProgram {
    ...ReferralProgramFields
  }
  currentVolumeDiscountProgram {
    ...VolumeDiscountFields
  }
  defaultBuybackFee: networkParameter(key: "market.fee.factors.buybackFee") {
    value
  }
  defaultInfrastructureFee: networkParameter(
    key: "market.fee.factors.infrastructureFee"
  ) {
    value
  }
  defaultMakerFee: networkParameter(key: "market.fee.factors.makerFee") {
    value
  }
  defaultTreasuryFee: networkParameter(key: "market.fee.factors.treasuryFee") {
    value
  }
  feesPerMarket: marketsConnection {
    edges {
      node {
        state
        fees {
          factors {
            makerFee
            infrastructureFee
            liquidityFee
            buyBackFee
            treasuryFee
          }
        }
      }
    }
  }
}
    ${ReferralProgramFieldsFragmentDoc}
${VolumeDiscountFieldsFragmentDoc}`;

/**
 * __useCurrentProgramsQuery__
 *
 * To run a query within a React component, call `useCurrentProgramsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentProgramsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentProgramsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentProgramsQuery(baseOptions?: Apollo.QueryHookOptions<CurrentProgramsQuery, CurrentProgramsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentProgramsQuery, CurrentProgramsQueryVariables>(CurrentProgramsDocument, options);
      }
export function useCurrentProgramsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentProgramsQuery, CurrentProgramsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentProgramsQuery, CurrentProgramsQueryVariables>(CurrentProgramsDocument, options);
        }
export type CurrentProgramsQueryHookResult = ReturnType<typeof useCurrentProgramsQuery>;
export type CurrentProgramsLazyQueryHookResult = ReturnType<typeof useCurrentProgramsLazyQuery>;
export type CurrentProgramsQueryResult = Apollo.QueryResult<CurrentProgramsQuery, CurrentProgramsQueryVariables>;