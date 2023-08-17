import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, lpPriceRange: string, positionDecimalPlaces: number, linearSlippageFactor: string, quadraticSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset', quantum: string, assetId: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct' } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateSpotMarket' } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | null };


export const ProposalDocument = gql`
    query Proposal($proposalId: ID!) {
  proposal(id: $proposalId) {
    id
    rationale {
      title
      description
    }
    reference
    state
    datetime
    rejectionReason
    party {
      id
    }
    errorDetails
    terms {
      closingDatetime
      enactmentDatetime
      change {
        ... on NewMarket {
          decimalPlaces
          metadata
          lpPriceRange
          riskParameters {
            ... on LogNormalRiskModel {
              riskAversionParameter
              tau
              params {
                mu
                r
                sigma
              }
            }
            ... on SimpleRiskModel {
              params {
                factorLong
                factorShort
              }
            }
          }
          instrument {
            name
            code
            futureProduct {
              settlementAsset {
                id
                name
                symbol
                decimals
                quantum
              }
              quoteName
              dataSourceSpecForSettlementData {
                sourceType {
                  ... on DataSourceDefinitionInternal {
                    sourceType {
                      ... on DataSourceSpecConfigurationTime {
                        conditions {
                          operator
                          value
                        }
                      }
                    }
                  }
                  ... on DataSourceDefinitionExternal {
                    sourceType {
                      ... on DataSourceSpecConfiguration {
                        signers {
                          signer {
                            ... on PubKey {
                              key
                            }
                            ... on ETHAddress {
                              address
                            }
                          }
                        }
                        filters {
                          key {
                            name
                            type
                          }
                          conditions {
                            operator
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
              dataSourceSpecBinding {
                settlementDataProperty
                tradingTerminationProperty
              }
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
            triggeringRatio
            targetStakeParameters {
              timeWindow
              scalingFactor
            }
          }
          positionDecimalPlaces
          lpPriceRange
          linearSlippageFactor
          quadraticSlippageFactor
        }
        ... on UpdateMarket {
          marketId
          updateMarketConfiguration {
            instrument {
              code
              product {
                ... on UpdateFutureProduct {
                  quoteName
                  dataSourceSpecForSettlementData {
                    sourceType {
                      ... on DataSourceDefinitionInternal {
                        sourceType {
                          ... on DataSourceSpecConfigurationTime {
                            conditions {
                              operator
                              value
                            }
                          }
                        }
                      }
                      ... on DataSourceDefinitionExternal {
                        sourceType {
                          ... on DataSourceSpecConfiguration {
                            signers {
                              signer {
                                ... on PubKey {
                                  key
                                }
                                ... on ETHAddress {
                                  address
                                }
                              }
                            }
                            filters {
                              key {
                                name
                                type
                              }
                              conditions {
                                operator
                                value
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  dataSourceSpecBinding {
                    settlementDataProperty
                    tradingTerminationProperty
                  }
                }
              }
            }
            metadata
            priceMonitoringParameters {
              triggers {
                horizonSecs
                probability
                auctionExtensionSecs
              }
            }
            liquidityMonitoringParameters {
              triggeringRatio
              targetStakeParameters {
                timeWindow
                scalingFactor
              }
            }
            riskParameters {
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
                    r
                    sigma
                    mu
                  }
                }
              }
            }
          }
        }
        ... on NewAsset {
          name
          symbol
          decimals
          quantum
          source {
            ... on BuiltinAsset {
              maxFaucetAmountMint
            }
            ... on ERC20 {
              contractAddress
              lifetimeLimit
              withdrawThreshold
            }
          }
        }
        ... on UpdateNetworkParameter {
          networkParameter {
            key
            value
          }
        }
        ... on UpdateAsset {
          quantum
          assetId
          source {
            ... on UpdateERC20 {
              lifetimeLimit
              withdrawThreshold
            }
          }
        }
      }
    }
    votes {
      yes {
        totalTokens
        totalNumber
        totalEquityLikeShareWeight
      }
      no {
        totalTokens
        totalNumber
        totalEquityLikeShareWeight
      }
    }
  }
}
    `;

/**
 * __useProposalQuery__
 *
 * To run a query within a React component, call `useProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useProposalQuery(baseOptions: Apollo.QueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
      }
export function useProposalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
        }
export type ProposalQueryHookResult = ReturnType<typeof useProposalQuery>;
export type ProposalLazyQueryHookResult = ReturnType<typeof useProposalLazyQuery>;
export type ProposalQueryResult = Apollo.QueryResult<ProposalQuery, ProposalQueryVariables>;