import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalTermsJson } from '../proposal-terms-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';
import type {
  ProposalFields,
  ProposalFields_terms,
} from '../../__generated__/ProposalFields';

interface ProposalProps {
  proposal: ProposalFields;
  terms: ProposalFields_terms;
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
