import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateMarketStatesFragment = { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } };

export type UpdateReferralProgramsFragment = { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> };

export type UpdateVolumeDiscountProgramsFragment = { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> };

export type IUpdateMarketFieldsFragment = { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } };

export type INewMarketFieldsFragment = { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } };

export type INewAssetFieldsFragment = { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } };

export type IUpdateAssetFieldsFragment = { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } };

export type IUpdateNetworkParameterFieldsFragment = { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } };

export type INewSpotMarketFragment = { __typename?: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null };

export type IUpdateSpotMarketFragment = { __typename?: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } };

export type VoteFieldsFragment = { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } };

export type ProposalTermsFieldsFragment = { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } };

export type ProposalFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } };

export type BatchProposalFieldsFragment = { __typename?: 'BatchProposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, batchTerms?: { __typename?: 'BatchProposalTerms', closingDatetime: any, changes: Array<{ __typename?: 'BatchProposalTermsChange', enactmentDatetime?: any | null } | null> } | null, subProposals?: Array<{ __typename?: 'ProposalDetail', id?: string | null, batchId?: string | null, datetime: any, terms?: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } } | null } | null> | null, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } };

export type ProposalsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProposalsQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', proposalNode?: { __typename: 'BatchProposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, batchTerms?: { __typename?: 'BatchProposalTerms', closingDatetime: any, changes: Array<{ __typename?: 'BatchProposalTermsChange', enactmentDatetime?: any | null } | null> } | null, subProposals?: Array<{ __typename?: 'ProposalDetail', id?: string | null, batchId?: string | null, datetime: any, terms?: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } } | null } | null> | null, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | { __typename: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | null } | null> | null } | null };

export type ProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['ID'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'BatchProposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, batchTerms?: { __typename?: 'BatchProposalTerms', closingDatetime: any, changes: Array<{ __typename?: 'BatchProposalTermsChange', enactmentDatetime?: any | null } | null> } | null, subProposals?: Array<{ __typename?: 'ProposalDetail', id?: string | null, batchId?: string | null, datetime: any, terms?: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } } | null } | null> | null, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: any, rejectionReason?: Types.ProposalRejectionReason | null, errorDetails?: string | null, rationale: { __typename?: 'ProposalRationale', title: string, description: string }, party: { __typename?: 'Party', id: string }, terms: { __typename?: 'ProposalTerms', closingDatetime: any, enactmentDatetime?: any | null, change: { __typename: 'CancelTransfer' } | { __typename: 'NewAsset', name: string, symbol: string, decimals: number, quantum: string, source: { __typename?: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename?: 'ERC20', contractAddress: string, withdrawThreshold: string, lifetimeLimit: string } } | { __typename: 'NewFreeform' } | { __typename: 'NewMarket', decimalPlaces: number, metadata?: Array<string> | null, positionDecimalPlaces: number, linearSlippageFactor: string, riskParameters: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } }, successorConfiguration?: { __typename?: 'SuccessorConfiguration', parentMarketId: string } | null, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } } } | { __typename?: 'PerpetualProduct', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | { __typename?: 'SpotProduct' } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } } } | { __typename: 'NewSpotMarket', priceDecimalPlaces: number, sizeDecimalPlaces: number, tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'InstrumentConfiguration', name: string, code: string, product?: { __typename?: 'FutureProduct' } | { __typename?: 'PerpetualProduct' } | { __typename?: 'SpotProduct', name: string, baseAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string }, quoteAsset: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string } } | null }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number }, spotRiskParameter?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', mu: number, r: number, sigma: number } } | { __typename?: 'SimpleRiskModel', params: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } } | null, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } | { __typename: 'NewTransfer' } | { __typename: 'UpdateAsset', assetId: string, quantum: string, source: { __typename?: 'UpdateERC20', lifetimeLimit: string, withdrawThreshold: string } } | { __typename: 'UpdateMarket', marketId: string, updateMarketConfiguration: { __typename?: 'UpdateMarketConfiguration', metadata?: Array<string | null> | null, instrument: { __typename?: 'UpdateInstrumentConfiguration', code: string, product: { __typename?: 'UpdateFutureProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } | { __typename?: 'UpdatePerpetualProduct', quoteName: string, dataSourceSpecForSettlementData: { __typename?: 'DataSourceDefinition', sourceType: { __typename?: 'DataSourceDefinitionExternal', sourceType: { __typename?: 'DataSourceSpecConfiguration', signers?: Array<{ __typename?: 'Signer', signer: { __typename?: 'ETHAddress', address?: string | null } | { __typename?: 'PubKey', key?: string | null } }> | null, filters?: Array<{ __typename?: 'Filter', key: { __typename?: 'PropertyKey', name?: string | null, type: Types.PropertyKeyType }, conditions?: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null }> | null }> | null } | { __typename?: 'EthCallSpec' } } | { __typename?: 'DataSourceDefinitionInternal', sourceType: { __typename?: 'DataSourceSpecConfigurationTime', conditions: Array<{ __typename?: 'Condition', operator: Types.ConditionOperator, value?: string | null } | null> } | { __typename?: 'DataSourceSpecConfigurationTimeTrigger' } } }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecPerpetualBinding', settlementDataProperty: string, settlementScheduleProperty: string } } }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquidityMonitoringParameters: { __typename?: 'LiquidityMonitoringParameters', targetStakeParameters: { __typename?: 'TargetStakeParameters', timeWindow: number, scalingFactor: number } }, riskParameters: { __typename?: 'UpdateMarketLogNormalRiskModel', logNormal?: { __typename?: 'LogNormalRiskModel', riskAversionParameter: number, tau: number, params: { __typename?: 'LogNormalModelParams', r: number, sigma: number, mu: number } } | null } | { __typename?: 'UpdateMarketSimpleRiskModel', simple?: { __typename?: 'SimpleRiskModelParams', factorLong: number, factorShort: number } | null } } } | { __typename: 'UpdateMarketState', updateType: Types.MarketUpdateType, price?: string | null, market: { __typename?: 'Market', decimalPlaces: number, id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string, product: { __typename: 'Future', quoteName: string } | { __typename: 'Perpetual', quoteName: string } | { __typename: 'Spot' } } } } } | { __typename: 'UpdateNetworkParameter', networkParameter: { __typename?: 'NetworkParameter', key: string, value: string } } | { __typename: 'UpdateReferralProgram', windowLength: number, endOfProgram: any, benefitTiers: Array<{ __typename?: 'BenefitTier', minimumEpochs: number, minimumRunningNotionalTakerVolume: string, referralDiscountFactor: string, referralRewardFactor: string }>, stakingTiers: Array<{ __typename?: 'StakingTier', minimumStakedTokens: string, referralRewardMultiplier: string }> } | { __typename: 'UpdateSpotMarket', marketId: string, updateSpotMarketConfiguration: { __typename?: 'UpdateSpotMarketConfiguration', tickSize: string, spotMetadata: Array<string>, instrument: { __typename?: 'UpdateSpotInstrumentConfiguration', code: string, name: string }, priceMonitoringParameters: { __typename?: 'PriceMonitoringParameters', triggers?: Array<{ __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number }> | null }, liquiditySLAParams: { __typename?: 'LiquiditySLAParameters', priceRange: string, commitmentMinTimeFraction: string, performanceHysteresisEpochs: number, slaCompetitionFactor: string }, liquidityFeeSettings?: { __typename?: 'LiquidityFeeSettings', method: Types.LiquidityFeeMethod, feeConstant?: string | null } | null } } | { __typename: 'UpdateVolumeDiscountProgram', endOfProgramTimestamp: any, windowLength: number, benefitTiers: Array<{ __typename?: 'VolumeBenefitTier', minimumRunningNotionalTakerVolume: string, volumeDiscountFactor: string }> } }, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalEquityLikeShareWeight: string } } } | null };

export const UpdateMarketStatesFragmentDoc = gql`
    fragment UpdateMarketStates on UpdateMarketState {
  __typename
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
    `;
export const UpdateReferralProgramsFragmentDoc = gql`
    fragment UpdateReferralPrograms on UpdateReferralProgram {
  __typename
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
    `;
export const UpdateVolumeDiscountProgramsFragmentDoc = gql`
    fragment UpdateVolumeDiscountPrograms on UpdateVolumeDiscountProgram {
  __typename
  benefitTiers {
    minimumRunningNotionalTakerVolume
    volumeDiscountFactor
  }
  endOfProgramTimestamp
  windowLength
}
    `;
export const INewMarketFieldsFragmentDoc = gql`
    fragment INewMarketFields on NewMarket {
  __typename
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
  successorConfiguration {
    parentMarketId
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
}
    `;
export const IUpdateMarketFieldsFragmentDoc = gql`
    fragment IUpdateMarketFields on UpdateMarket {
  __typename
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
    `;
export const INewAssetFieldsFragmentDoc = gql`
    fragment INewAssetFields on NewAsset {
  __typename
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
      withdrawThreshold
      lifetimeLimit
    }
  }
}
    `;
export const IUpdateNetworkParameterFieldsFragmentDoc = gql`
    fragment IUpdateNetworkParameterFields on UpdateNetworkParameter {
  __typename
  networkParameter {
    key
    value
  }
}
    `;
export const IUpdateAssetFieldsFragmentDoc = gql`
    fragment IUpdateAssetFields on UpdateAsset {
  __typename
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
export const INewSpotMarketFragmentDoc = gql`
    fragment INewSpotMarket on NewSpotMarket {
  instrument {
    name
    code
    product {
      ... on SpotProduct {
        name
        baseAsset {
          id
          name
          symbol
          decimals
          quantum
        }
        quoteAsset {
          id
          name
          symbol
          decimals
          quantum
        }
      }
    }
  }
  priceDecimalPlaces
  spotMetadata: metadata
  priceMonitoringParameters {
    triggers {
      horizonSecs
      probability
      auctionExtensionSecs
    }
  }
  targetStakeParameters {
    timeWindow
    scalingFactor
  }
  spotRiskParameter: riskParameters {
    ... on SimpleRiskModel {
      params {
        factorLong
        factorShort
      }
    }
    ... on LogNormalRiskModel {
      riskAversionParameter
      tau
      params {
        mu
        r
        sigma
      }
    }
  }
  sizeDecimalPlaces
  liquiditySLAParams {
    priceRange
    commitmentMinTimeFraction
    performanceHysteresisEpochs
    slaCompetitionFactor
  }
  liquidityFeeSettings {
    method
    feeConstant
  }
  tickSize
}
    `;
export const IUpdateSpotMarketFragmentDoc = gql`
    fragment IUpdateSpotMarket on UpdateSpotMarket {
  marketId
  updateSpotMarketConfiguration {
    instrument {
      ... on UpdateSpotInstrumentConfiguration {
        code
        name
      }
    }
    spotMetadata: metadata
    priceMonitoringParameters {
      triggers {
        horizonSecs
        probability
        auctionExtensionSecs
      }
    }
    liquiditySLAParams {
      priceRange
      commitmentMinTimeFraction
      performanceHysteresisEpochs
      slaCompetitionFactor
    }
    liquidityFeeSettings {
      method
      feeConstant
    }
    tickSize
  }
}
    `;
export const ProposalTermsFieldsFragmentDoc = gql`
    fragment ProposalTermsFields on ProposalTerms {
  closingDatetime
  enactmentDatetime
  change {
    __typename
    ...UpdateMarketStates
    ...UpdateReferralPrograms
    ...UpdateVolumeDiscountPrograms
    ...INewMarketFields
    ...IUpdateMarketFields
    ...INewAssetFields
    ...IUpdateNetworkParameterFields
    ...IUpdateAssetFields
    ...INewSpotMarket
    ...IUpdateSpotMarket
  }
}
    ${UpdateMarketStatesFragmentDoc}
${UpdateReferralProgramsFragmentDoc}
${UpdateVolumeDiscountProgramsFragmentDoc}
${INewMarketFieldsFragmentDoc}
${IUpdateMarketFieldsFragmentDoc}
${INewAssetFieldsFragmentDoc}
${IUpdateNetworkParameterFieldsFragmentDoc}
${IUpdateAssetFieldsFragmentDoc}
${INewSpotMarketFragmentDoc}
${IUpdateSpotMarketFragmentDoc}`;
export const VoteFieldsFragmentDoc = gql`
    fragment VoteFields on ProposalVotes {
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
    `;
export const ProposalFieldsFragmentDoc = gql`
    fragment ProposalFields on Proposal {
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
    ...ProposalTermsFields
  }
  votes {
    ...VoteFields
  }
}
    ${ProposalTermsFieldsFragmentDoc}
${VoteFieldsFragmentDoc}`;
export const BatchProposalFieldsFragmentDoc = gql`
    fragment BatchProposalFields on BatchProposal {
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
  batchTerms {
    closingDatetime
    changes {
      enactmentDatetime
    }
  }
  subProposals {
    id
    batchId
    datetime
    terms {
      ...ProposalTermsFields
    }
  }
  votes {
    ...VoteFields
  }
}
    ${ProposalTermsFieldsFragmentDoc}
${VoteFieldsFragmentDoc}`;
export const ProposalsDocument = gql`
    query Proposals {
  proposalsConnection {
    edges {
      proposalNode {
        __typename
        ... on Proposal {
          ...ProposalFields
        }
        ... on BatchProposal {
          ...BatchProposalFields
        }
      }
    }
  }
}
    ${ProposalFieldsFragmentDoc}
${BatchProposalFieldsFragmentDoc}`;

/**
 * __useProposalsQuery__
 *
 * To run a query within a React component, call `useProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsQuery({
 *   variables: {
 *   },
 * });
 */
export function useProposalsQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
      }
export function useProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
        }
export type ProposalsQueryHookResult = ReturnType<typeof useProposalsQuery>;
export type ProposalsLazyQueryHookResult = ReturnType<typeof useProposalsLazyQuery>;
export type ProposalsQueryResult = Apollo.QueryResult<ProposalsQuery, ProposalsQueryVariables>;
export const ProposalDocument = gql`
    query Proposal($proposalId: ID!) {
  proposal(id: $proposalId) {
    ... on Proposal {
      ...ProposalFields
    }
    ... on BatchProposal {
      ...BatchProposalFields
    }
  }
}
    ${ProposalFieldsFragmentDoc}
${BatchProposalFieldsFragmentDoc}`;

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