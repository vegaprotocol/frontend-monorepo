import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalsListItemProps {
  proposal: Proposals_proposals;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li
      className="py-4 border-b border-neutral-400"
      id={proposal.id}
      data-testid="proposals-list-item"
    >
      <ProposalHeader proposal={proposal} />
      <ProposalsListItemDetails proposal={proposal} />
    </li>
  );
};
