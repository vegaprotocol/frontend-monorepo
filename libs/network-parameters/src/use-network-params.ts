import compact from 'lodash/compact';
import { useMemo } from 'react';
import {
  useNetworkParamQuery,
  useNetworkParamsQuery,
} from './__generated__/NetworkParams';

export const NetworkParams = {
  blockchains_ethereumConfig: 'blockchains_ethereumConfig',
  blockchains_evmBridgeConfigs: 'blockchains_evmBridgeConfigs',
  reward_asset: 'reward_asset',
  rewards_activityStreak_benefitTiers: 'rewards_activityStreak_benefitTiers',
  rewards_activityStreak_inactivityLimit:
    'rewards_activityStreak_inactivityLimit',
  rewards_vesting_benefitTiers: 'rewards_vesting_benefitTiers',
  rewards_marketCreationQuantumMultiple:
    'rewards_marketCreationQuantumMultiple',
  reward_staking_delegation_payoutDelay:
    'reward_staking_delegation_payoutDelay',
  rewards_updateFrequency: 'rewards_updateFrequency',
  rewards_vesting_baseRate: 'rewards_vesting_baseRate',
  governance_proposal_market_minVoterBalance:
    'governance_proposal_market_minVoterBalance',
  governance_proposal_market_minClose: 'governance_proposal_market_minClose',
  governance_proposal_market_maxClose: 'governance_proposal_market_maxClose',
  governance_proposal_market_minEnact: 'governance_proposal_market_minEnact',
  governance_proposal_market_maxEnact: 'governance_proposal_market_maxEnact',
  governance_proposal_market_requiredMajority:
    'governance_proposal_market_requiredMajority',
  governance_proposal_market_requiredParticipation:
    'governance_proposal_market_requiredParticipation',
  governance_proposal_market_minProposerBalance:
    'governance_proposal_market_minProposerBalance',
  governance_proposal_updateMarket_minVoterBalance:
    'governance_proposal_updateMarket_minVoterBalance',
  governance_proposal_updateMarket_requiredMajority:
    'governance_proposal_updateMarket_requiredMajority',
  governance_proposal_updateMarket_requiredMajorityLP:
    'governance_proposal_updateMarket_requiredMajorityLP',
  governance_proposal_updateMarket_minClose:
    'governance_proposal_updateMarket_minClose',
  governance_proposal_updateMarket_maxClose:
    'governance_proposal_updateMarket_maxClose',
  governance_proposal_updateMarket_minEnact:
    'governance_proposal_updateMarket_minEnact',
  governance_proposal_updateMarket_maxEnact:
    'governance_proposal_updateMarket_maxEnact',
  governance_proposal_updateMarket_requiredParticipation:
    'governance_proposal_updateMarket_requiredParticipation',
  governance_proposal_updateMarket_requiredParticipationLP:
    'governance_proposal_updateMarket_requiredParticipationLP',
  governance_proposal_updateMarket_minProposerBalance:
    'governance_proposal_updateMarket_minProposerBalance',
  governance_proposal_VolumeRebateProgram_requiredMajority:
    'governance_proposal_VolumeRebateProgram_requiredMajority',
  governance_proposal_VolumeRebateProgram_requiredParticipation:
    'governance_proposal_VolumeRebateProgram_requiredParticipation',
  governance_proposal_asset_minVoterBalance:
    'governance_proposal_asset_minVoterBalance',
  governance_proposal_asset_minClose: 'governance_proposal_asset_minClose',
  governance_proposal_asset_maxClose: 'governance_proposal_asset_maxClose',
  governance_proposal_asset_minEnact: 'governance_proposal_asset_minEnact',
  governance_proposal_asset_maxEnact: 'governance_proposal_asset_maxEnact',
  governance_proposal_asset_requiredMajority:
    'governance_proposal_asset_requiredMajority',
  governance_proposal_asset_requiredParticipation:
    'governance_proposal_asset_requiredParticipation',
  governance_proposal_asset_minProposerBalance:
    'governance_proposal_asset_minProposerBalance',
  governance_proposal_updateAsset_minVoterBalance:
    'governance_proposal_updateAsset_minVoterBalance',
  governance_proposal_updateAsset_minClose:
    'governance_proposal_updateAsset_minClose',
  governance_proposal_updateAsset_maxClose:
    'governance_proposal_updateAsset_maxClose',
  governance_proposal_updateAsset_minEnact:
    'governance_proposal_updateAsset_minEnact',
  governance_proposal_updateAsset_maxEnact:
    'governance_proposal_updateAsset_maxEnact',
  governance_proposal_updateAsset_requiredMajority:
    'governance_proposal_updateAsset_requiredMajority',
  governance_proposal_updateAsset_requiredParticipation:
    'governance_proposal_updateAsset_requiredParticipation',
  governance_proposal_updateAsset_minProposerBalance:
    'governance_proposal_updateAsset_minProposerBalance',
  governance_proposal_updateNetParam_minClose:
    'governance_proposal_updateNetParam_minClose',
  governance_proposal_updateNetParam_minVoterBalance:
    'governance_proposal_updateNetParam_minVoterBalance',
  governance_proposal_updateNetParam_maxClose:
    'governance_proposal_updateNetParam_maxClose',
  governance_proposal_updateNetParam_minEnact:
    'governance_proposal_updateNetParam_minEnact',
  governance_proposal_updateNetParam_maxEnact:
    'governance_proposal_updateNetParam_maxEnact',
  governance_proposal_updateNetParam_requiredMajority:
    'governance_proposal_updateNetParam_requiredMajority',
  governance_proposal_updateNetParam_requiredParticipation:
    'governance_proposal_updateNetParam_requiredParticipation',
  governance_proposal_updateNetParam_minProposerBalance:
    'governance_proposal_updateNetParam_minProposerBalance',
  governance_proposal_freeform_minVoterBalance:
    'governance_proposal_freeform_minVoterBalance',
  governance_proposal_freeform_minClose:
    'governance_proposal_freeform_minClose',
  governance_proposal_freeform_maxClose:
    'governance_proposal_freeform_maxClose',
  governance_proposal_freeform_requiredParticipation:
    'governance_proposal_freeform_requiredParticipation',
  governance_proposal_freeform_requiredMajority:
    'governance_proposal_freeform_requiredMajority',
  governance_proposal_freeform_minProposerBalance:
    'governance_proposal_freeform_minProposerBalance',
  governance_proposal_referralProgram_minClose:
    'governance_proposal_referralProgram_minClose',
  governance_proposal_referralProgram_minEnact:
    'governance_proposal_referralProgram_minEnact',
  governance_proposal_referralProgram_minProposerBalance:
    'governance_proposal_referralProgram_minProposerBalance',
  governance_proposal_referralProgram_minVoterBalance:
    'governance_proposal_referralProgram_minVoterBalance',
  governance_proposal_referralProgram_requiredMajority:
    'governance_proposal_referralProgram_requiredMajority',
  governance_proposal_referralProgram_requiredParticipation:
    'governance_proposal_referralProgram_requiredParticipation',
  governance_proposal_VolumeDiscountProgram_maxClose:
    'governance_proposal_VolumeDiscountProgram_maxClose',
  governance_proposal_VolumeDiscountProgram_maxEnact:
    'governance_proposal_VolumeDiscountProgram_maxEnact',
  governance_proposal_VolumeDiscountProgram_minClose:
    'governance_proposal_VolumeDiscountProgram_minClose',
  governance_proposal_VolumeDiscountProgram_minEnact:
    'governance_proposal_VolumeDiscountProgram_minEnact',
  governance_proposal_VolumeDiscountProgram_minProposerBalance:
    'governance_proposal_VolumeDiscountProgram_minProposerBalance',
  governance_proposal_VolumeDiscountProgram_minVoterBalance:
    'governance_proposal_VolumeDiscountProgram_minVoterBalance',
  governance_proposal_VolumeDiscountProgram_requiredMajority:
    'governance_proposal_VolumeDiscountProgram_requiredMajority',
  governance_proposal_VolumeDiscountProgram_requiredParticipation:
    'governance_proposal_VolumeDiscountProgram_requiredParticipation',
  governance_proposal_transfer_maxAmount:
    'governance_proposal_transfer_maxAmount',
  governance_proposal_transfer_maxClose:
    'governance_proposal_transfer_maxClose',
  governance_proposal_transfer_maxEnact:
    'governance_proposal_transfer_maxEnact',
  governance_proposal_transfer_maxFraction:
    'governance_proposal_transfer_maxFraction',
  governance_proposal_transfer_minClose:
    'governance_proposal_transfer_minClose',
  governance_proposal_transfer_minEnact:
    'governance_proposal_transfer_minEnact',
  governance_proposal_transfer_minProposerBalance:
    'governance_proposal_transfer_minProposerBalance',
  governance_proposal_transfer_minVoterBalance:
    'governance_proposal_transfer_minVoterBalance',
  governance_proposal_transfer_requiredMajority:
    'governance_proposal_transfer_requiredMajority',
  governance_proposal_transfer_requiredParticipation:
    'governance_proposal_transfer_requiredParticipation',
  validators_delegation_minAmount: 'validators_delegation_minAmount',
  spam_protection_minimumWithdrawalQuantumMultiple:
    'spam_protection_minimumWithdrawalQuantumMultiple',
  spam_protection_voting_min_tokens: 'spam_protection_voting_min_tokens',
  spam_protection_proposal_min_tokens: 'spam_protection_proposal_min_tokens',
  spam_protection_max_stopOrdersPerMarket:
    'spam.protection.max.stopOrdersPerMarket',
  market_fee_factors_infrastructureFee: 'market_fee_factors_infrastructureFee',
  market_fee_factors_makerFee: 'market_fee_factors_makerFee',
  market_liquidity_targetstake_triggering_ratio:
    'market_liquidity_targetstake_triggering_ratio',
  market_liquidity_bondPenaltyParameter:
    'market_liquidity_bondPenaltyParameter',
  market_liquidity_sla_nonPerformanceBondPenaltySlope:
    'market_liquidity_sla_nonPerformanceBondPenaltySlope',
  market_liquidity_sla_nonPerformanceBondPenaltyMax:
    'market_liquidity_sla_nonPerformanceBondPenaltyMax',
  market_liquidity_maximumLiquidityFeeFactorLevel:
    'market_liquidity_maximumLiquidityFeeFactorLevel',
  market_liquidity_stakeToCcyVolume: 'market_liquidity_stakeToCcyVolume',
  validators_epoch_length: 'validators_epoch_length',
  market_liquidity_earlyExitPenalty: 'market_liquidity_earlyExitPenalty',
  market_liquidity_probabilityOfTrading_tau_scaling:
    'market_liquidity_probabilityOfTrading_tau_scaling',
  market_liquidity_minimum_probabilityOfTrading_lpOrders:
    'market_liquidity_minimum_probabilityOfTrading_lpOrders',
  market_liquidity_feeCalculationTimeStep:
    'market_liquidity_feeCalculationTimeStep',
  transfer_fee_factor: 'transfer_fee_factor',
  transfer_minTransferQuantumMultiple: 'transfer_minTransferQuantumMultiple',
  network_validators_incumbentBonus: 'network_validators_incumbentBonus',
} as const;

type Params = typeof NetworkParams;
export type NetworkParamsKey = keyof Params;
export type NetworkParamsResult = {
  [key in keyof Params]: string;
};

export const useNetworkParams = <T extends NetworkParamsKey[]>(params?: T) => {
  const { data, loading, error } = useNetworkParamsQuery();

  const paramsObj = useMemo(() => {
    if (!data?.networkParametersConnection.edges) return null;
    return compact(data.networkParametersConnection.edges)
      .map((p) => ({
        ...p.node,
        key: toInternalKey(p.node.key),
      }))
      .filter((p) => {
        if (params === undefined || params.length === 0) return true;
        if (params.includes(p.key as NetworkParamsKey)) return true;
        return false;
      })
      .reduce((obj, p) => {
        obj[p.key] = p.value;
        return obj;
      }, {} as { [key: string]: string });
  }, [data, params]);

  return {
    params: paramsObj as Pick<NetworkParamsResult, T[number]>,
    loading,
    error,
  };
};

export const useNetworkParam = (param: NetworkParamsKey) => {
  const { data, loading, error } = useNetworkParamQuery({
    variables: {
      key: toRealKey(param),
    },
  });

  return {
    param: data?.networkParameter ? data.networkParameter.value : null,
    loading,
    error,
  };
};

export const toRealKey = (key: NetworkParamsKey) => {
  return key.split('_').join('.');
};

export const toInternalKey = (key: string) => {
  return key.split('.').join('_');
};
