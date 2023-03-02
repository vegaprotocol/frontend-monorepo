import { RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalsListItemProps {
  proposal?: ProposalFieldsFragment | ProposalQuery['proposal'] | null;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  if (!proposal || !proposal.id) return null;

  return (
    <li id={proposal.id} data-testid="proposals-list-item">
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <ProposalHeader proposal={proposal} />
        <ProposalsListItemDetails proposal={proposal} />
      </RoundedWrapper>
    </li>
  );
};
