import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalsListItemProps {
  proposal: Proposals_proposals;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li className="last:mb-0 mb-24" key={proposal.id}>
      <ProposalHeader proposal={proposal} />
      <ProposalsListItemDetails proposal={proposal} />
    </li>
  );
};
