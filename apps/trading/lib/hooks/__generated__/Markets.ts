import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { SourceTypeFragmentDoc, FutureFragmentDoc, PerpetualFragmentDoc, PriceConfigurationFragmentDoc, SpotFragmentDoc } from '../../../../../libs/markets/src/lib/components/market-info/__generated__/MarketInfo';
import { MarketDataUpdateFieldsFragmentDoc } from '../../../../../libs/markets/src/lib/__generated__/market-data';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PriceConfigurationV2Fragment = { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null };

export type CandleFragment = { __typename?: 'Candle', periodStart: any, high: string, low: string, open: string, close: string, volume: string, notional: string };

export type MarketDataStaticV2Fragment = { __typename?: 'MarketData', auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, lastTradedPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, productData?: { __typename?: 'PerpetualData', fundingRate?: string | null, fundingPayment?: string | null, externalTwap?: string | null, internalTwap?: string | null } | null, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null };

export type MarketFieldsV2Fragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tickSize: string, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', feeConstant?: string | null, method: Types.LiquidityFeeMethod } | null }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null } | { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', proposed?: any | null, pending: any, open: any, close: any }, markPriceConfiguration: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null }, data?: { __typename?: 'MarketData', auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, lastTradedPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, productData?: { __typename?: 'PerpetualData', fundingRate?: string | null, fundingPayment?: string | null, externalTwap?: string | null, internalTwap?: string | null } | null, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null } | null, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', periodStart: any, high: string, low: string, open: string, close: string, volume: string, notional: string } } | null> | null } | null };

export type MarketsV2QueryVariables = Types.Exact<{
  since: Types.Scalars['String'];
}>;


export type MarketsV2Query = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tickSize: string, parentMarketID?: string | null, successorMarketID?: string | null, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', feeConstant?: string | null, method: Types.LiquidityFeeMethod } | null }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'Perpetual', quoteName: string, fundingRateScalingFactor?: string | null, fundingRateLowerBound?: string | null, fundingRateUpperBound?: string | null, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number, quantum: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string, data: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string }, internalCompositePriceConfig?: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null } | null } | { __typename?: 'Spot', baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string, chainId: string } } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', proposed?: any | null, pending: any, open: any, close: any }, markPriceConfiguration: { __typename?: 'CompositePriceConfiguration', decayWeight: string, decayPower: number, cashAmount: string, SourceWeights?: Array<string> | null, SourceStalenessTolerance: Array<string>, CompositePriceType: Types.CompositePriceType, dataSourcesSpec?: Array<{ __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } | { __typename?: 'EthCallSpec', abi?: Array<string> | null, address: string, args?: Array<string> | null, method: string, requiredConfirmations: number, normalisers?: Array<{ __typename?: 'Normaliser', name: string, expression: string }> | null, trigger: { __typename?: 'EthCallTrigger', trigger: { __typename?: 'EthTimeTrigger', initial?: any | null, every?: number | null, until?: any | null } }, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType, numberDecimalPlaces?: number | null }, conditions?: Array<{ __typename?: 'Condition', value?: string | null, operator: Types.ConditionOperator }> | null }> | null } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename: 'DataSourceSpecConfigurationTimeTrigger', triggers: Array<{ __typename?: 'InternalTimeTrigger', initial?: number | null, every?: number | null } | null>, conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } } } | null> | null, dataSourcesSpecBinding?: Array<{ __typename?: 'SpecBindingForCompositePrice', priceSourceProperty: string } | null> | null }, data?: { __typename?: 'MarketData', auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, lastTradedPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, productData?: { __typename?: 'PerpetualData', fundingRate?: string | null, fundingPayment?: string | null, externalTwap?: string | null, internalTwap?: string | null } | null, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null } | null, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', periodStart: any, high: string, low: string, open: string, close: string, volume: string, notional: string } } | null> | null } | null } }> } | null };

export type MarketDataV2Fragment = { __typename?: 'ObservableMarketData', marketId: string, auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, lastTradedPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, productData?: { __typename?: 'PerpetualData', fundingRate?: string | null, fundingPayment?: string | null, externalTwap?: string | null, internalTwap?: string | null } | null, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null };

export type MarketDataV2SubscriptionVariables = Types.Exact<{
  marketIds: Array<Types.Scalars['ID']> | Types.Scalars['ID'];
}>;


export type MarketDataV2Subscription = { __typename?: 'Subscription', marketsData: Array<{ __typename?: 'ObservableMarketData', marketId: string, auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, markPrice: string, lastTradedPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, productData?: { __typename?: 'PerpetualData', fundingRate?: string | null, fundingPayment?: string | null, externalTwap?: string | null, internalTwap?: string | null } | null, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null }> };

export const PriceConfigurationV2FragmentDoc = gql`
    fragment PriceConfigurationV2 on CompositePriceConfiguration {
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
export const MarketDataStaticV2FragmentDoc = gql`
    fragment MarketDataStaticV2 on MarketData {
  auctionEnd
  auctionStart
  bestBidPrice
  bestBidVolume
  bestOfferPrice
  bestOfferVolume
  bestStaticBidPrice
  bestStaticBidVolume
  bestStaticOfferPrice
  bestStaticOfferVolume
  productData {
    ... on PerpetualData {
      fundingRate
      fundingPayment
      externalTwap
      internalTwap
    }
  }
  indicativePrice
  indicativeVolume
  marketState
  marketTradingMode
  markPrice
  lastTradedPrice
  midPrice
  openInterest
  priceMonitoringBounds {
    minValidPrice
    maxValidPrice
    trigger {
      horizonSecs
      probability
      auctionExtensionSecs
    }
    referencePrice
  }
  staticMidPrice
  suppliedStake
  targetStake
  trigger
  lastTradedPrice
}
    `;
export const CandleFragmentDoc = gql`
    fragment Candle on Candle {
  periodStart
  high
  low
  open
  close
  volume
  notional
}
    `;
export const MarketFieldsV2FragmentDoc = gql`
    fragment MarketFieldsV2 on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  tickSize
  parentMarketID
  successorMarketID
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
  data {
    ...MarketDataStaticV2
  }
  candlesConnection(since: $since, interval: INTERVAL_I1H, pagination: {last: 24}) {
    edges {
      node {
        ...Candle
      }
    }
  }
}
    ${FutureFragmentDoc}
${PerpetualFragmentDoc}
${SpotFragmentDoc}
${PriceConfigurationFragmentDoc}
${MarketDataStaticV2FragmentDoc}
${CandleFragmentDoc}`;
export const MarketDataV2FragmentDoc = gql`
    fragment MarketDataV2 on ObservableMarketData {
  marketId
  auctionEnd
  auctionStart
  bestBidPrice
  bestBidVolume
  bestOfferPrice
  bestOfferVolume
  bestStaticBidPrice
  bestStaticBidVolume
  bestStaticOfferPrice
  bestStaticOfferVolume
  productData {
    ... on PerpetualData {
      fundingRate
      fundingPayment
      externalTwap
      internalTwap
    }
  }
  indicativePrice
  indicativeVolume
  marketState
  marketTradingMode
  markPrice
  lastTradedPrice
  midPrice
  openInterest
  priceMonitoringBounds {
    minValidPrice
    maxValidPrice
    trigger {
      horizonSecs
      probability
      auctionExtensionSecs
    }
    referencePrice
  }
  staticMidPrice
  suppliedStake
  targetStake
  trigger
  lastTradedPrice
}
    `;
export const MarketsV2Document = gql`
    query MarketsV2($since: String!) {
  marketsConnection {
    edges {
      node {
        ...MarketFieldsV2
      }
    }
  }
}
    ${MarketFieldsV2FragmentDoc}`;

/**
 * __useMarketsV2Query__
 *
 * To run a query within a React component, call `useMarketsV2Query` and pass it any options that fit your needs.
 * When your component renders, `useMarketsV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsV2Query({
 *   variables: {
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketsV2Query(baseOptions: Apollo.QueryHookOptions<MarketsV2Query, MarketsV2QueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsV2Query, MarketsV2QueryVariables>(MarketsV2Document, options);
      }
export function useMarketsV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsV2Query, MarketsV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsV2Query, MarketsV2QueryVariables>(MarketsV2Document, options);
        }
export type MarketsV2QueryHookResult = ReturnType<typeof useMarketsV2Query>;
export type MarketsV2LazyQueryHookResult = ReturnType<typeof useMarketsV2LazyQuery>;
export type MarketsV2QueryResult = Apollo.QueryResult<MarketsV2Query, MarketsV2QueryVariables>;
export const MarketDataV2Document = gql`
    subscription MarketDataV2($marketIds: [ID!]!) {
  marketsData(marketIds: $marketIds) {
    ...MarketDataUpdateFields
  }
}
    ${MarketDataUpdateFieldsFragmentDoc}`;

/**
 * __useMarketDataV2Subscription__
 *
 * To run a query within a React component, call `useMarketDataV2Subscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataV2Subscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataV2Subscription({
 *   variables: {
 *      marketIds: // value for 'marketIds'
 *   },
 * });
 */
export function useMarketDataV2Subscription(baseOptions: Apollo.SubscriptionHookOptions<MarketDataV2Subscription, MarketDataV2SubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDataV2Subscription, MarketDataV2SubscriptionVariables>(MarketDataV2Document, options);
      }
export type MarketDataV2SubscriptionHookResult = ReturnType<typeof useMarketDataV2Subscription>;
export type MarketDataV2SubscriptionResult = Apollo.SubscriptionResult<MarketDataV2Subscription>;