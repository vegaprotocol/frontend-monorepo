import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NewMarketFieldsFragment = { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } };

export type UpdateMarketFieldsFragment = { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } };

export type UpdateAssetFieldsFragment = { __typename?: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } };

export type ProposalListFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } } | { __typename?: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename?: 'UpdateNetworkParameter' } } };

export type ProposalsListQueryVariables = Types.Exact<{
  proposalType?: Types.InputMaybe<Types.ProposalType>;
  inState?: Types.InputMaybe<Types.ProposalState>;
}>;


export type ProposalsListQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } } | { __typename?: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename?: 'UpdateNetworkParameter' } } } } | null> | null } | null };

export const NewMarketFieldsFragmentDoc = gql`
    fragment NewMarketFields on NewMarket {
  instrument {
    code
    name
    futureProduct {
      settlementAsset {
        id
        name
        symbol
      }
    }
  }
}
    `;
export const UpdateMarketFieldsFragmentDoc = gql`
    fragment UpdateMarketFields on UpdateMarket {
  marketId
  updateMarketConfiguration {
    instrument {
      code
      product {
        quoteName
      }
    }
    priceMonitoringParameters {
      triggers {
        horizonSecs
        probability
        auctionExtensionSecs
      }
    }
    liquidityMonitoringParameters {
      targetStakeParameters {
        timeWindow
        scalingFactor
      }
      triggeringRatio
    }
    riskParameters {
      __typename
      ... on UpdateMarketSimpleRiskModel {
        simple {
          factorLong
          factorShort
        }
      }
      ... on UpdateMarketLogNormalRiskModel {
        logNormal {
          riskAversionParameter
          tau
          params {
            mu
            r
            sigma
          }
        }
      }
    }
  }
}
    `;
export const UpdateAssetFieldsFragmentDoc = gql`
    fragment UpdateAssetFields on UpdateAsset {
  assetId
  quantum
  source {
    ... on UpdateERC20 {
      lifetimeLimit
      withdrawThreshold
    }
  }
}
    `;
export const ProposalListFieldsFragmentDoc = gql`
    fragment ProposalListFields on Proposal {
  id
  reference
  state
  datetime
  votes {
    yes {
      totalTokens
      totalNumber
      totalWeight
    }
    no {
      totalTokens
      totalNumber
      totalWeight
    }
  }
  terms {
    closingDatetime
    enactmentDatetime
    change {
      ... on NewMarket {
        ...NewMarketFields
      }
      ... on UpdateMarket {
        ...UpdateMarketFields
      }
      ... on UpdateAsset {
        ...UpdateAssetFields
      }
    }
  }
}
    ${NewMarketFieldsFragmentDoc}
${UpdateMarketFieldsFragmentDoc}
${UpdateAssetFieldsFragmentDoc}`;
export const ProposalsListDocument = gql`
    query ProposalsList($proposalType: ProposalType, $inState: ProposalState) {
  proposalsConnection(proposalType: $proposalType, inState: $inState) {
    edges {
      node {
        ...ProposalListFields
      }
    }
  }
}
    ${ProposalListFieldsFragmentDoc}`;

/**
 * __useProposalsListQuery__
 *
 * To run a query within a React component, call `useProposalsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsListQuery({
 *   variables: {
 *      proposalType: // value for 'proposalType'
 *      inState: // value for 'inState'
 *   },
 * });
 */
export function useProposalsListQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsListQuery, ProposalsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsListQuery, ProposalsListQueryVariables>(ProposalsListDocument, options);
      }
export function useProposalsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsListQuery, ProposalsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsListQuery, ProposalsListQueryVariables>(ProposalsListDocument, options);
        }
export type ProposalsListQueryHookResult = ReturnType<typeof useProposalsListQuery>;
export type ProposalsListLazyQueryHookResult = ReturnType<typeof useProposalsListLazyQuery>;
export type ProposalsListQueryResult = Apollo.QueryResult<ProposalsListQuery, ProposalsListQueryVariables>;