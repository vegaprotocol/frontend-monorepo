import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NewMarketFieldsFragment = { __typename?: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | null }, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } };

export type UpdateMarketFieldsFragment = { __typename?: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } };

export type NewAssetFieldsFragment = { __typename?: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } };

export type UpdateAssetFieldsFragment = { __typename?: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } };

export type UpdateNetworkParameterFieldsFragment = { __typename?: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } };

export type ProposalListFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, requiredMajority: string, requiredParticipation: string, requiredLpMajority?: string | null, requiredLpParticipation?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | null }, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } } | { __typename: 'NewSpotMarket' } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState' } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateSpotMarket' } } };

export type ProposalsListQueryVariables = Types.Exact<{
  proposalType?: Types.InputMaybe<Types.ProposalType>;
  inState?: Types.InputMaybe<Types.ProposalState>;
}>;


export type ProposalsListQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, requiredMajority: string, requiredParticipation: string, requiredLpMajority?: string | null, requiredLpParticipation?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, futureProduct?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | null }, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } } | { __typename: 'NewSpotMarket' } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal' } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', triggeringRatio: string, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | null } | { __typename: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState' } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateSpotMarket' } } } } | null> | null } | null };

export type NewMarketSuccessorFieldsFragment = { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null };

export type SuccessorProposalListFieldsFragment = { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateSpotMarket' } } };

export type SuccessorProposalsListQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SuccessorProposalsListQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, terms: { __typename?: 'ProposalTerms', change: { __typename?: 'CancelTransfer' } | { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', name: string }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null } | { __typename?: 'NewSpotMarket' } | { __typename?: 'NewTransfer' } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateMarketState' } | { __typename?: 'UpdateNetworkParameter' } | { __typename?: 'UpdateSpotMarket' } } } } | null> | null } | null };

export const NewMarketFieldsFragmentDoc = gql`
    fragment NewMarketFields on NewMarket {
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
      dataSourceSpecForTradingTermination {
        sourceType {
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
  decimalPlaces
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
  metadata
}
    `;
export const UpdateMarketFieldsFragmentDoc = gql`
    fragment UpdateMarketFields on UpdateMarket {
  marketId
  updateMarketConfiguration {
    instrument {
      code
      product {
        ... on UpdateFutureProduct {
          quoteName
          dataSourceSpecForSettlementData {
            sourceType {
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
          dataSourceSpecForTradingTermination {
            sourceType {
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
          dataSourceSpecForSettlementSchedule {
            sourceType {
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
export const NewAssetFieldsFragmentDoc = gql`
    fragment NewAssetFields on NewAsset {
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
export const UpdateNetworkParameterFieldsFragmentDoc = gql`
    fragment UpdateNetworkParameterFields on UpdateNetworkParameter {
  networkParameter {
    key
    value
  }
}
    `;
export const ProposalListFieldsFragmentDoc = gql`
    fragment ProposalListFields on Proposal {
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
  errorDetails
  rejectionReason
  requiredMajority
  requiredParticipation
  requiredLpMajority
  requiredLpParticipation
  terms {
    closingDatetime
    enactmentDatetime
    change {
      __typename
      ... on NewMarket {
        ...NewMarketFields
      }
      ... on UpdateMarket {
        ...UpdateMarketFields
      }
      ... on NewAsset {
        ...NewAssetFields
      }
      ... on UpdateAsset {
        ...UpdateAssetFields
      }
      ... on UpdateNetworkParameter {
        ...UpdateNetworkParameterFields
      }
    }
  }
}
    ${NewMarketFieldsFragmentDoc}
${UpdateMarketFieldsFragmentDoc}
${NewAssetFieldsFragmentDoc}
${UpdateAssetFieldsFragmentDoc}
${UpdateNetworkParameterFieldsFragmentDoc}`;
export const NewMarketSuccessorFieldsFragmentDoc = gql`
    fragment NewMarketSuccessorFields on NewMarket {
  instrument {
    name
  }
  successorConfiguration {
    parentMarketId
  }
}
    `;
export const SuccessorProposalListFieldsFragmentDoc = gql`
    fragment SuccessorProposalListFields on Proposal {
  id
  terms {
    change {
      ... on NewMarket {
        ...NewMarketSuccessorFields
      }
    }
  }
}
    ${NewMarketSuccessorFieldsFragmentDoc}`;
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
export const SuccessorProposalsListDocument = gql`
    query SuccessorProposalsList {
  proposalsConnection(proposalType: TYPE_NEW_MARKET, inState: STATE_OPEN) {
    edges {
      node {
        ...SuccessorProposalListFields
      }
    }
  }
}
    ${SuccessorProposalListFieldsFragmentDoc}`;

/**
 * __useSuccessorProposalsListQuery__
 *
 * To run a query within a React component, call `useSuccessorProposalsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuccessorProposalsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuccessorProposalsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useSuccessorProposalsListQuery(baseOptions?: Apollo.QueryHookOptions<SuccessorProposalsListQuery, SuccessorProposalsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuccessorProposalsListQuery, SuccessorProposalsListQueryVariables>(SuccessorProposalsListDocument, options);
      }
export function useSuccessorProposalsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuccessorProposalsListQuery, SuccessorProposalsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuccessorProposalsListQuery, SuccessorProposalsListQueryVariables>(SuccessorProposalsListDocument, options);
        }
export type SuccessorProposalsListQueryHookResult = ReturnType<typeof useSuccessorProposalsListQuery>;
export type SuccessorProposalsListLazyQueryHookResult = ReturnType<typeof useSuccessorProposalsListLazyQuery>;
export type SuccessorProposalsListQueryResult = Apollo.QueryResult<SuccessorProposalsListQuery, SuccessorProposalsListQueryVariables>;