import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { BigNumber } from '../../../lib/bignumber';
import { type ProposalChangeType } from '../types';

const REQUIRED_PARAMS = [
  NetworkParams.governance_proposal_updateMarket_requiredMajority,
  NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
  NetworkParams.governance_proposal_updateMarket_requiredParticipation,
  NetworkParams.governance_proposal_updateMarket_requiredParticipationLP,
  NetworkParams.governance_proposal_market_requiredMajority,
  NetworkParams.governance_proposal_market_requiredParticipation,
  NetworkParams.governance_proposal_updateAsset_requiredMajority,
  NetworkParams.governance_proposal_referralProgram_requiredMajority,
  NetworkParams.governance_proposal_referralProgram_requiredParticipation,
  NetworkParams.governance_proposal_updateAsset_requiredParticipation,
  NetworkParams.governance_proposal_asset_requiredMajority,
  NetworkParams.governance_proposal_asset_requiredParticipation,
  NetworkParams.governance_proposal_updateNetParam_requiredMajority,
  NetworkParams.governance_proposal_updateNetParam_requiredParticipation,
  NetworkParams.governance_proposal_freeform_requiredMajority,
  NetworkParams.governance_proposal_freeform_requiredParticipation,
  NetworkParams.governance_proposal_VolumeDiscountProgram_requiredMajority,
  NetworkParams.governance_proposal_VolumeDiscountProgram_requiredParticipation,
  NetworkParams.governance_proposal_transfer_requiredParticipation,
  NetworkParams.governance_proposal_transfer_requiredMajority,
];

export const useProposalNetworkParams = () => {
  const { params } = useNetworkParams(REQUIRED_PARAMS);

  const fallback = {
    requiredMajority: new BigNumber(1),
    requiredMajorityLP: new BigNumber(0),
    requiredParticipation: new BigNumber(1),
    requiredParticipationLP: new BigNumber(0),
  };

  if (!params) {
    return;
  }

  const result: Record<
    ProposalChangeType,
    {
      requiredMajority: BigNumber;
      requiredParticipation: BigNumber;
      requiredMajorityLP: BigNumber;
      requiredParticipationLP: BigNumber;
    }
  > = {
    NewMarket: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_market_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_market_requiredParticipation || 1
      ),
    },
    NewSpotMarket: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_market_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_market_requiredParticipation || 1
      ),
    },
    UpdateMarket: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority || 1
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP || 0
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation || 1
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP || 0
      ),
    },
    UpdateMarketState: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority || 1
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP || 0
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation || 1
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP || 0
      ),
    },
    UpdateSpotMarket: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority || 1
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP || 0
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation || 1
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP || 0
      ),
    },
    UpdateNetworkParameter: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_updateNetParam_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateNetParam_requiredParticipation || 1
      ),
    },
    NewAsset: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_asset_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_asset_requiredParticipation || 1
      ),
    },
    UpdateAsset: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_updateAsset_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateAsset_requiredParticipation || 1
      ),
    },
    NewFreeform: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_freeform_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_freeform_requiredParticipation || 1
      ),
    },
    UpdateReferralProgram: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_referralProgram_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_referralProgram_requiredParticipation || 1
      ),
    },
    UpdateVolumeDiscountProgram: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_VolumeDiscountProgram_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_VolumeDiscountProgram_requiredParticipation ||
          1
      ),
    },
    NewTransfer: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_transfer_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_transfer_requiredParticipation || 1
      ),
    },
    CancelTransfer: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_transfer_requiredMajority || 1
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_transfer_requiredParticipation || 1
      ),
    },
  };

  return result;
};
