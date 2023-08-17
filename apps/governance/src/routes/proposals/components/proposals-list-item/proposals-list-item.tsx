import { RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalsListItemDetails } from './proposals-list-item-details';
import { useUserVote } from '../vote-details/use-user-vote';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { NetworkParamsResult } from '@vegaprotocol/network-parameters';

interface ProposalsListItemProps {
  proposal?: ProposalFieldsFragment | ProposalQuery['proposal'] | null;
  networkParams: Partial<NetworkParamsResult> | null;
}

export const ProposalsListItem = ({
  proposal,
  networkParams,
}: ProposalsListItemProps) => {
  const { voteState } = useUserVote(proposal?.id);
  if (!proposal || !proposal.id || !networkParams) return null;

  return (
    <li id={proposal.id} data-testid="proposals-list-item">
      <RoundedWrapper paddingBottom={true} heightFull={true}>
        <ProposalHeader
          proposal={proposal}
          networkParams={networkParams}
          voteState={voteState}
        />
        <ProposalsListItemDetails proposal={proposal} />
      </RoundedWrapper>
    </li>
  );
};
