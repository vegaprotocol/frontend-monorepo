import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalsListItemProps {
  proposal: Proposals_proposals;
}

export const ProposalsListItem = ({
  proposal,
  ...props
}: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li
      className="mx-[-20px] px-20 py-20 odd:bg-white-10"
      id={proposal.id}
      data-testid="proposals-list-item"
      {...props}
    >
      <ProposalHeader proposal={proposal} />
      <ProposalsListItemDetails proposal={proposal} />
    </li>
  );
};
