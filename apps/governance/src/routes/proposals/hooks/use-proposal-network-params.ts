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
        params.governance_proposal_market_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_market_requiredParticipation
      ),
    },
    NewSpotMarket: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_market_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_market_requiredParticipation
      ),
    },
    UpdateMarket: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP
      ),
    },
    UpdateMarketState: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP
      ),
    },
    UpdateSpotMarket: {
      requiredMajority: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajority
      ),
      requiredMajorityLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredMajorityLP
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipation
      ),
      requiredParticipationLP: new BigNumber(
        params.governance_proposal_updateMarket_requiredParticipationLP
      ),
    },
    UpdateNetworkParameter: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_updateNetParam_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateNetParam_requiredParticipation
      ),
    },
    NewAsset: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_asset_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_asset_requiredParticipation
      ),
    },
    UpdateAsset: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_updateAsset_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_updateAsset_requiredParticipation
      ),
    },
    NewFreeform: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_freeform_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_freeform_requiredParticipation
      ),
    },
    UpdateReferralProgram: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_referralProgram_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_referralProgram_requiredParticipation
      ),
    },
    UpdateVolumeDiscountProgram: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_VolumeDiscountProgram_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_VolumeDiscountProgram_requiredParticipation
      ),
    },
    NewTransfer: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_transfer_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_transfer_requiredParticipation
      ),
    },
    CancelTransfer: {
      ...fallback,
      requiredMajority: new BigNumber(
        params.governance_proposal_transfer_requiredMajority
      ),
      requiredParticipation: new BigNumber(
        params.governance_proposal_transfer_requiredParticipation
      ),
    },
  };

  return result;
};
