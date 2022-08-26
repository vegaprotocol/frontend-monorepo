import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import type {
  Proposal_proposal,
  Proposal_proposal_terms,
} from '@vegaprotocol/governance';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalTermsJson } from '../proposal-terms-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';

interface ProposalProps {
  proposal: Proposal_proposal;
  terms: Proposal_proposal_terms;
}

export const Proposal = ({ proposal, terms }: ProposalProps) => {
  if (!proposal) {
    return null;
  }

  return (
    <>
      <ProposalHeader proposal={proposal} />
      <div className="mb-8">
        <ProposalChangeTable proposal={proposal} />
      </div>
      <div className="mb-8">
        <VoteDetails proposal={proposal} />
      </div>
      <div className="mb-8">
        <ProposalVotesTable proposal={proposal} />
      </div>
      <ProposalTermsJson terms={terms} />
    </>
  );
};
