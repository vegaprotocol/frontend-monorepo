import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { AssetFieldsFragmentDoc } from '../../../../../../assets/src/lib/__generated__/Asset';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DataSourceFilterFragment = { __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null };

export type SourceType_DataSourceDefinitionExternal_Fragment = { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } };

export type SourceType_DataSourceDefinitionInternal_Fragment = { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } };

export type SourceTypeFragment = SourceType_DataSourceDefinitionExternal_Fragment | SourceType_DataSourceDefinitionInternal_Fragment;

export type PriceConfigurationFragment = { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null };

export type DataSourceFragment = { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } };

export type FutureFragment = { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } };

export type PerpetualFragment = { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null };

export type SpotFragment = { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null } };

export type MarketInfoQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketInfoQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tickSize: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode, linearSlippageFactor: string, parentMarketID?: string | null, successorMarketID?: string | null, marketProposal?: { __typename?: 'BatchProposal' } | { __typename?: 'Proposal', id?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string } } | null, marketTimestamps: { __typename?: 'MarketTimestamps', proposed?: any | null, pending: any, open: any, close: any }, markPriceConfiguration: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null }, openingAuction: { __typename?: 'AuctionDuration', durationSecs: number, volume: number }, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, decimals: number } } } | null> | null } | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', feeConstant?: string | null, method: Types.LiquidityFeeMethod } | null }, priceMonitoringSettings: { __typename?: 'PriceMonitoringSettings', parameters?: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null } | null }, riskFactors?: { __typename?: 'RiskFactor', market: string, short: string, long: string } | null, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, liquiditySLAParameters?: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string } | null, liquidationStrategy?: { __typename?: 'LiquidationStrategy', disposalTimeStep: number, disposalFraction: string, fullDisposalSize: number, maxFractionConsumed: string } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null } | { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null } } }, riskModel: { __typename?: 'LogNormalRiskModel', tau: number, riskAversionParameter: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, marginCalculator?: { __typename?: 'MarginCalculator', scalingFactors: { __typename?: 'ScalingFactors', searchLevel: number, initialMargin: number, collateralRelease: number } } | null } } | null };

export const DataSourceFilterFragmentDoc = gql`
    fragment DataSourceFilter on Filter {
  key {
    name
    type
    numberDecimalPlaces
  }
  conditions {
    value
    operator
  }
}
    `;
export const SourceTypeFragmentDoc = gql`
    fragment SourceType on DataSourceKind {
  ... on DataSourceDefinitionExternal {
    sourceType {
      ... on EthCallSpec {
        abi
        address
        args
        method
        requiredConfirmations
        normalisers {
          name
          expression
        }
        trigger {
          trigger {
            ... on EthTimeTrigger {
              initial
              every
              until
            }
          }
        }
        filters {
          key {
            name
            type
            numberDecimalPlaces
          }
          conditions {
            value
            operator
          }
        }
      }
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
          ...DataSourceFilter
        }
      }
    }
  }
  ... on DataSourceDefinitionInternal {
    sourceType {
      ... on DataSourceSpecConfigurationTime {
        conditions {
          operator
          value
        }
      }
      ... on DataSourceSpecConfigurationTimeTrigger {
        __typename
        triggers {
          initial
          every
        }
        conditions {
          operator
          value
        }
      }
    }
  }
}
    ${DataSourceFilterFragmentDoc}`;
export const DataSourceFragmentDoc = gql`
    fragment DataSource on DataSourceSpec {
  id
  data {
    sourceType {
      ...SourceType
    }
  }
}
    ${SourceTypeFragmentDoc}`;
export const FutureFragmentDoc = gql`
    fragment Future on Future {
  quoteName
  settlementAsset {
    ...AssetFields
  }
  dataSourceSpecForSettlementData {
    id
  }
  dataSourceSpecForTradingTermination {
    id
  }
  dataSourceSpecBinding {
    settlementDataProperty
    tradingTerminationProperty
  }
}
    ${AssetFieldsFragmentDoc}`;
export const PriceConfigurationFragmentDoc = gql`
    fragment PriceConfiguration on CompositePriceConfiguration {
  decayWeight
  decayPower
  cashAmount
  SourceWeights
  SourceStalenessTolerance
  CompositePriceType
  dataSourcesSpec {
    sourceType {
      ...SourceType
    }
  }
  dataSourcesSpecBinding {
    priceSourceProperty
  }
}
    ${SourceTypeFragmentDoc}`;
export const PerpetualFragmentDoc = gql`
    fragment Perpetual on Perpetual {
  quoteName
  fundingRateScalingFactor
  fundingRateLowerBound
  fundingRateUpperBound
  settlementAsset {
    ...AssetFields
  }
  dataSourceSpecForSettlementData {
    id
  }
  dataSourceSpecForSettlementSchedule {
    id
  }
  dataSourceSpecBinding {
    settlementDataProperty
    settlementScheduleProperty
  }
  internalCompositePriceConfig {
    ...PriceConfiguration
  }
}
    ${AssetFieldsFragmentDoc}
${PriceConfigurationFragmentDoc}`;
export const SpotFragmentDoc = gql`
    fragment Spot on Spot {
  baseAsset {
    ...AssetFields
  }
  quoteAsset {
    ...AssetFields
  }
}
    ${AssetFieldsFragmentDoc}`;
export const MarketInfoDocument = gql`
    query MarketInfo($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    tickSize
    state
    tradingMode
    linearSlippageFactor
    parentMarketID
    successorMarketID
    marketProposal {
      ... on Proposal {
        id
        rationale {
          title
          description
        }
      }
    }
    marketTimestamps {
      proposed
      pending
      open
      close
    }
    markPriceConfiguration {
      ...PriceConfiguration
    }
    openingAuction {
      durationSecs
      volume
    }
    accountsConnection {
      edges {
        node {
          type
          asset {
            id
            decimals
          }
          balance
        }
      }
    }
    fees {
      factors {
        makerFee
        infrastructureFee
        liquidityFee
      }
      liquidityFeeSettings {
        feeConstant
        method
      }
    }
    priceMonitoringSettings {
      parameters {
        triggers {
          horizonSecs
          probability
          auctionExtensionSecs
        }
      }
    }
    riskFactors {
      market
      short
      long
    }
    liquidityMonitoringParameters {
      targetStakeParameters {
        timeWindow
        scalingFactor
      }
    }
    liquiditySLAParameters {
      priceRange
      commitmentMinTimeFraction
      performanceHysteresisEpochs
      slaCompetitionFactor
    }
    liquidationStrategy {
      disposalTimeStep
      disposalFraction
      fullDisposalSize
      maxFractionConsumed
    }
    tradableInstrument {
      instrument {
        id
        name
        code
        metadata {
          tags
        }
        product {
          ... on Future {
            ...Future
          }
          ... on Perpetual {
            ...Perpetual
          }
          ... on Spot {
            ...Spot
          }
        }
      }
      riskModel {
        ... on LogNormalRiskModel {
          tau
          riskAversionParameter
          params {
            r
            sigma
            mu
          }
        }
        ... on SimpleRiskModel {
          params {
            factorLong
            factorShort
          }
        }
      }
      marginCalculator {
        scalingFactors {
          searchLevel
          initialMargin
          collateralRelease
        }
      }
    }
  }
}
    ${PriceConfigurationFragmentDoc}
${FutureFragmentDoc}
${PerpetualFragmentDoc}
${SpotFragmentDoc}`;

/**
 * __useMarketInfoQuery__
 *
 * To run a query within a React component, call `useMarketInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketInfoQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketInfoQuery(baseOptions: Apollo.QueryHookOptions<MarketInfoQuery, MarketInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketInfoQuery, MarketInfoQueryVariables>(MarketInfoDocument, options);
      }
export function useMarketInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketInfoQuery, MarketInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketInfoQuery, MarketInfoQueryVariables>(MarketInfoDocument, options);
        }
export type MarketInfoQueryHookResult = ReturnType<typeof useMarketInfoQuery>;
export type MarketInfoLazyQueryHookResult = ReturnType<typeof useMarketInfoLazyQuery>;
export type MarketInfoQueryResult = Apollo.QueryResult<MarketInfoQuery, MarketInfoQueryVariables>;