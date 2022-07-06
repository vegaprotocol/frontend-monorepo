import { ProposalDetailHeader } from '../proposal-detail-header/proposal-detail-header';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';
import type { RestProposalResponse } from '../../proposal/proposal-container';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalTermsJson } from '../proposal-terms-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';

interface ProposalProps {
  proposal: Proposal_proposal;
  terms: RestProposalResponse;
}

export const Proposal = ({ proposal, terms }: ProposalProps) => {
  if (!proposal) {
    return null;
  }

  return (
    <>
      <ProposalDetailHeader proposal={proposal} />
      <ProposalChangeTable proposal={proposal} />
      <VoteDetails proposal={proposal} />
      <ProposalVotesTable proposal={proposal} />
      <ProposalTermsJson terms={terms} />
    </>
  );
};
