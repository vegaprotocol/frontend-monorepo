import { RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { useUserVote } from '../vote-details/use-user-vote';
import { type ListProposal, type ListBatchProposal } from '../../types';

interface ProposalsListItemProps {
  proposal?: ListProposal | ListBatchProposal;
}

export const ProposalsListItem = ({ proposal }: ProposalsListItemProps) => {
  const { voteState } = useUserVote(proposal?.id);
  if (!proposal || !proposal.id) return null;

  if (proposal.__typename === 'Proposal') {
    return (
      <li id={proposal.id} data-testid="proposals-list-item">
        <RoundedWrapper paddingBottom={true} heightFull={true}>
          <ProposalHeader proposal={proposal} voteState={voteState} />
          <ProposalsListItemDetails
            id={proposal.id}
            type={proposal.terms.change.__typename}
            state={proposal.state}
            closingDatetime={proposal.terms.closingDatetime}
            enactmentDatetime={proposal.terms.enactmentDatetime}
            rejectionReason={proposal.rejectionReason}
          />
        </RoundedWrapper>
      </li>
    );
  }

  if (proposal.__typename === 'BatchProposal') {
    if (!proposal.subProposals) return null;
    const firstProposal = proposal.subProposals[0];
    if (!firstProposal?.terms) return null;

    return (
      <li id={proposal.id} data-testid="proposals-list-item">
        <RoundedWrapper paddingBottom={true} heightFull={true}>
          <ProposalHeader proposal={proposal} voteState={voteState} />
          <ProposalsListItemDetails
            id={proposal.id}
            type={firstProposal.terms.change.__typename}
            state={proposal.state}
            closingDatetime={firstProposal.terms.closingDatetime}
            enactmentDatetime={firstProposal.terms.enactmentDatetime}
            rejectionReason={proposal.rejectionReason}
          />
        </RoundedWrapper>
      </li>
    );
  }

  return null;
};
