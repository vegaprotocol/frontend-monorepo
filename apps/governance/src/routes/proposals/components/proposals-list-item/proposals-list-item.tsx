import { RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { useUserVote } from '../vote-details/use-user-vote';
import { type Proposal, type BatchProposal } from '../../types';

interface ProposalsListItemProps {
  proposal?: Proposal | BatchProposal;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  const { voteState } = useUserVote(proposal?.id);
  if (!proposal || !proposal.id) return null;

  return (
    <li id={proposal.id} data-testid="proposals-list-item">
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <ProposalHeader proposal={proposal} voteState={voteState} />
        {/* <ProposalsListItemDetails */}
        {/*   id={proposal.id} */}
        {/*   type={proposal.terms.change.__typename} */}
        {/*   state={proposal.state} */}
        {/*   closingDatetime={proposal.terms.closingDatetime} */}
        {/*   enactmentDatetime={proposal.terms.enactmentDatetime} */}
        {/*   rejectionReason={proposal.rejectionReason} */}
        {/* /> */}
      </RoundedWrapper>
    </li>
  );
};
