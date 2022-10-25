import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';
import { BigNumber } from '../../../lib/bignumber';
import type { Proposal_proposal } from '../proposal/__generated__/Proposal';

export const useProposalNetworkParams = ({
  proposal,
}: {
  proposal: Proposal_proposal;
}) => {
  const { params } = useNetworkParams([
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_updateMarket_requiredParticipation,
    NetworkParams.governance_proposal_updateMarket_requiredParticipationLP,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_market_requiredParticipation,
    NetworkParams.governance_proposal_updateAsset_requiredMajority,
    NetworkParams.governance_proposal_updateAsset_requiredParticipation,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_asset_requiredParticipation,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredParticipation,
    NetworkParams.governance_proposal_freeform_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredParticipation,
  ]);

  if (!params) {
    return {
      requiredMajority: new BigNumber(1),
      requiredMajorityLP: new BigNumber(0),
      requiredParticipation: new BigNumber(1),
      requiredParticipationLP: new BigNumber(0),
    };
  }

  switch (proposal.terms.change.__typename) {
    case 'UpdateMarket':
      return {
        requiredMajority:
          params.governance_proposal_updateMarket_requiredMajority,
        requiredMajorityLP:
          params.governance_proposal_updateMarket_requiredMajorityLP,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateMarket_requiredParticipation
        ),
        requiredParticipationLP: new BigNumber(
          params.governance_proposal_updateMarket_requiredParticipationLP
        ),
      };
    case 'UpdateNetworkParameter':
      return {
        requiredMajority:
          params.governance_proposal_updateNetParam_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateNetParam_requiredParticipation
        ),
      };
    case 'NewAsset':
      return {
        requiredMajority: params.governance_proposal_asset_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_asset_requiredParticipation
        ),
      };
    case 'UpdateAsset':
      return {
        requiredMajority:
          params.governance_proposal_updateAsset_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateAsset_requiredParticipation
        ),
      };
    case 'NewMarket':
      return {
        requiredMajority: params.governance_proposal_market_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_market_requiredParticipation
        ),
      };
    case 'NewFreeform':
      return {
        requiredMajority: params.governance_proposal_freeform_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_freeform_requiredParticipation
        ),
      };
    default:
      throw new Error('Unknown proposal type');
  }
};
