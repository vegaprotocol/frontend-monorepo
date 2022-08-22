import { ProposalState, ProposalStateMapping } from '@vegaprotocol/types';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { state } = proposal;
  let className = 'text-white';

  if (
    state === ProposalState.STATE_DECLINED ||
    state === ProposalState.STATE_FAILED ||
    state === ProposalState.STATE_REJECTED
  ) {
    className = 'text-danger';
  } else if (
    state === ProposalState.STATE_ENACTED ||
    state === ProposalState.STATE_PASSED
  ) {
    className = 'text-white';
  }
  return <span className={className}>{ProposalStateMapping[state]}</span>;
};
