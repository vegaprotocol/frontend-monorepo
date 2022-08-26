import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import type { Proposal_proposal } from '@vegaprotocol/governance';

interface ProposalsListItemProps {
  proposal: Proposal_proposal;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li
      className="py-4 border-b border-neutral-400 last:border-0"
      id={proposal.id}
      data-testid="proposals-list-item"
    >
      <ProposalHeader proposal={proposal} />
      <ProposalsListItemDetails proposal={proposal} />
    </li>
  );
};
