import compact from 'lodash/compact';
import { useMemo } from 'react';
import {
  useNetworkParamQuery,
  useNetworkParamsQuery,
} from './__generated__/NetworkParams';

export const NetworkParams = {
  blockchains_ethereumConfig: 'blockchains_ethereumConfig',
  reward_asset: 'reward_asset',
  reward_staking_delegation_payoutDelay:
    'reward_staking_delegation_payoutDelay',
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
  validators_delegation_minAmount: 'validators_delegation_minAmount',
  spam_protection_minimumWithdrawalQuantumMultiple:
    'spam_protection_minimumWithdrawalQuantumMultiple',
  spam_protection_voting_min_tokens: 'spam_protection_voting_min_tokens',
  spam_protection_proposal_min_tokens: 'spam_protection_proposal_min_tokens',
  market_liquidity_stakeToCcyVolume: 'market_liquidity_stakeToCcyVolume',
  market_liquidity_targetstake_triggering_ratio:
    'market_liquidity_targetstake_triggering_ratio',
  transfer_fee_factor: 'transfer_fee_factor',
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
