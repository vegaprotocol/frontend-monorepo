import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalTermsJson } from '../proposal-terms-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';

interface ProposalProps {
  proposal: Proposal_proposal;
}

export const Proposal = ({ proposal }: ProposalProps) => {
  if (!proposal) {
    return null;
  }

  return (
    <section data-testid="proposal">
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
      <ProposalTermsJson terms={proposal.terms} />
    </section>
  );
};
