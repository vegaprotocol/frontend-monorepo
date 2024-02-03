import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { BigNumber } from '../../../lib/bignumber';
import { type ProposalTermsFieldsFragment } from '../__generated__/Proposals';
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

export const useProposalNetworkParams = ({
  terms,
}: {
  terms: ProposalTermsFieldsFragment;
}) => {
  const { params } = useNetworkParams(REQUIRED_PARAMS);

  const fallback = {
    requiredMajority: new BigNumber(1),
    requiredMajorityLP: new BigNumber(0),
    requiredParticipation: new BigNumber(1),
    requiredParticipationLP: new BigNumber(0),
  };

  if (!params) {
    return fallback;
  }

  return getParamsForChangeType(params, terms.change.__typename);
};

export const useBatchProposalNetworkParams = ({
  terms,
}: {
  terms: ProposalTermsFieldsFragment[];
}) => {
  const { params } = useNetworkParams(REQUIRED_PARAMS);

  if (!params) {
    return;
  }

  return terms.map((t) => getParamsForChangeType(params, t.change.__typename));
};

const getParamsForChangeType = (
  // TODO: fix explicity any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
  changeType: ProposalChangeType
) => {
  const fallback = {
    requiredMajority: new BigNumber(1),
    requiredMajorityLP: new BigNumber(0),
    requiredParticipation: new BigNumber(1),
    requiredParticipationLP: new BigNumber(0),
  };

  switch (changeType) {
    case 'UpdateMarket':
    case 'UpdateMarketState':
      return {
        ...fallback,
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
      };
    case 'UpdateNetworkParameter':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_updateNetParam_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateNetParam_requiredParticipation
        ),
      };
    case 'NewAsset':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_asset_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_asset_requiredParticipation
        ),
      };
    case 'UpdateAsset':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_updateAsset_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateAsset_requiredParticipation
        ),
      };
    case 'NewMarket':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_market_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_market_requiredParticipation
        ),
      };
    case 'NewFreeform':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_freeform_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_freeform_requiredParticipation
        ),
      };
    case 'UpdateReferralProgram':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_referralProgram_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_referralProgram_requiredParticipation
        ),
      };
    case 'UpdateVolumeDiscountProgram':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_VolumeDiscountProgram_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_VolumeDiscountProgram_requiredParticipation
        ),
      };
    case 'NewTransfer':
    case 'CancelTransfer':
      return {
        ...fallback,
        requiredMajority: new BigNumber(
          params.governance_proposal_transfer_requiredMajority
        ),
        requiredParticipation: new BigNumber(
          params.governance_proposal_transfer_requiredParticipation
        ),
      };
    default:
      return fallback;
  }
};
