import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalTermsJson } from '../proposal-terms-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';
import { ProposalType } from '@vegaprotocol/types';

interface ProposalProps {
  proposal: Proposal_proposal;
}

export const Proposal = ({ proposal }: ProposalProps) => {
  const { params, loading, error } = useNetworkParams([
    NetworkParams.governance_proposal_market_minVoterBalance,
    NetworkParams.governance_proposal_updateMarket_minVoterBalance,
    NetworkParams.governance_proposal_asset_minVoterBalance,
    NetworkParams.governance_proposal_updateAsset_minVoterBalance,
    NetworkParams.governance_proposal_updateNetParam_minVoterBalance,
    NetworkParams.governance_proposal_freeform_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
  ]);

  if (!proposal) {
    return null;
  }

  let minVoterBalance = null;
  let proposalType = null;

  if (params) {
    switch (proposal.terms.change.__typename) {
      case 'NewMarket':
        minVoterBalance = params.governance_proposal_market_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NEW_MARKET;
        break;
      case 'UpdateMarket':
        minVoterBalance =
          params.governance_proposal_updateMarket_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_UPDATE_MARKET;
        break;
      case 'NewAsset':
        minVoterBalance = params.governance_proposal_asset_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NEW_ASSET;
        break;
      case 'UpdateAsset':
        minVoterBalance =
          params.governance_proposal_updateAsset_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_UPDATE_ASSET;
        break;
      case 'UpdateNetworkParameter':
        minVoterBalance =
          params.governance_proposal_updateNetParam_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NETWORK_PARAMETER;
        break;
      case 'NewFreeform':
        minVoterBalance = params.governance_proposal_freeform_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_FREEFORM;
        break;
    }
  }

  return (
    <AsyncRenderer data={params} loading={loading} error={error}>
      <section data-testid="proposal">
        <ProposalHeader proposal={proposal} />
        <div className="mb-8">
          <ProposalChangeTable proposal={proposal} />
        </div>
        <div className="mb-8">
          <VoteDetails
            proposal={proposal}
            proposalType={proposalType}
            minVoterBalance={minVoterBalance}
            spamProtectionMinTokens={params.spam_protection_voting_min_tokens}
          />
        </div>
        <div className="mb-8">
          <ProposalVotesTable proposal={proposal} />
        </div>
        <ProposalTermsJson terms={proposal.terms} />
      </section>
    </AsyncRenderer>
  );
};
