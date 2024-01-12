import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NewMarketProductFieldFragment = { __typename?: 'Proposal', terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', product?: { __typename: 'FutureProduct' } | { __typename: 'PerpetualProduct' } | { __typename: 'SpotProduct' } | null } } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } };

export type UpdateMarketStateFragment = { __typename?: 'Proposal', terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } };

export type UpdateReferralProgramFragment = { __typename?: 'Proposal', terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram' } } };

export type UpdateVolumeDiscountProgramFragment = { __typename?: 'Proposal', terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket' } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateReferralProgram' } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } } };

export type ProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
  includeNewMarketProductField: Types.Scalars['Boolean'];
  includeUpdateMarketState: Types.Scalars['Boolean'];
  includeUpdateReferralProgram: Types.Scalars['Boolean'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'BatchProposal' } | { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, quadraticSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset', quantum: string, assetId: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename?: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename?: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename?: 'UpdateSpotMarket' } | { __typename?: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | null };

export const NewMarketProductFieldFragmentDoc = gql`
    fragment NewMarketProductField on Proposal {
  terms {
    change {
      ... on NewMarket {
        instrument {
          product {
            __typename
          }
        }
      }
    }
  }
}
    `;
export const UpdateMarketStateFragmentDoc = gql`
    fragment UpdateMarketState on Proposal {
  terms {
    change {
      ... on UpdateMarketState {
        updateType
        market {
          decimalPlaces
          id
          tradableInstrument {
            instrument {
              product {
                __typename
                ... on Future {
                  quoteName
                }
                ... on Perpetual {
                  quoteName
                }
              }
              name
              code
            }
          }
        }
        updateType
        price
      }
    }
  }
}
    `;
export const UpdateReferralProgramFragmentDoc = gql`
    fragment UpdateReferralProgram on Proposal {
  terms {
    change {
      ... on UpdateReferralProgram {
        benefitTiers {
          minimumEpochs
          minimumRunningNotionalTakerVolume
          referralDiscountFactor
          referralRewardFactor
        }
        endOfProgram: endOfProgramTimestamp
        windowLength
        stakingTiers {
          minimumStakedTokens
          referralRewardMultiplier
        }
      }
    }
  }
}
    `;
export const UpdateVolumeDiscountProgramFragmentDoc = gql`
    fragment UpdateVolumeDiscountProgram on Proposal {
  terms {
    change {
      ... on UpdateVolumeDiscountProgram {
        benefitTiers {
          minimumRunningNotionalTakerVolume
          volumeDiscountFactor
        }
        endOfProgramTimestamp
        windowLength
      }
    }
  }
}
    `;
export const ProposalDocument = gql`
    query Proposal($proposalId: ID!, $includeNewMarketProductField: Boolean!, $includeUpdateMarketState: Boolean!, $includeUpdateReferralProgram: Boolean!) {
  proposal(id: $proposalId) {
    ... on Proposal {
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
      ...NewMarketProductField @include(if: $includeNewMarketProductField)
      ...UpdateMarketState @include(if: $includeUpdateMarketState)
      ...UpdateReferralProgram @include(if: $includeUpdateReferralProgram)
      ...UpdateVolumeDiscountProgram
      terms {
        closingDatetime
        enactmentDatetime
        change {
          ... on NewMarket {
            decimalPlaces
            metadata
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
              product {
                ... on FutureProduct {
                  settlementAsset {
                    id
                    name
                    symbol
                    decimals
                    quantum
                  }
                  quoteName
                  dataSourceSpecBinding {
                    settlementDataProperty
                    tradingTerminationProperty
                  }
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
                }
                ... on PerpetualProduct {
                  settlementAsset {
                    id
                    name
                    symbol
                    decimals
                    quantum
                  }
                  quoteName
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
              targetStakeParameters {
                timeWindow
                scalingFactor
              }
            }
            positionDecimalPlaces
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
                  ... on UpdatePerpetualProduct {
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
                      settlementScheduleProperty
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
}
    ${NewMarketProductFieldFragmentDoc}
${UpdateMarketStateFragmentDoc}
${UpdateReferralProgramFragmentDoc}
${UpdateVolumeDiscountProgramFragmentDoc}`;

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
 *      includeNewMarketProductField: // value for 'includeNewMarketProductField'
 *      includeUpdateMarketState: // value for 'includeUpdateMarketState'
 *      includeUpdateReferralProgram: // value for 'includeUpdateReferralProgram'
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