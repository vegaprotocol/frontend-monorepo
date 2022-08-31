import type { ProposalFields } from '../../__generated__/ProposalFields';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';

interface ProposalsListItemProps {
  proposal: ProposalFields;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li
      className="py-20 border-b border-white-40"
      id={proposal.id}
      data-testid="proposals-list-item"
    >
      <ProposalHeader proposal={proposal} />
      <ProposalsListItemDetails proposal={proposal} />
    </li>
  );
};
