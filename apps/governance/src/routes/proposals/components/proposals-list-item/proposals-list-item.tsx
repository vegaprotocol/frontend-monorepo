import { RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { useUserVote } from '../vote-details/use-user-vote';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalsListItemProps {
  proposal?: ProposalQuery['proposal'] | null;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  const { voteState } = useUserVote(proposal?.id);
  if (!proposal || !proposal.id) return null;

  return (
    <li id={proposal.id} data-testid="proposals-list-item">
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <ProposalHeader proposal={proposal} voteState={voteState} />
        <ProposalsListItemDetails proposal={proposal} />
      </RoundedWrapper>
    </li>
  );
};
