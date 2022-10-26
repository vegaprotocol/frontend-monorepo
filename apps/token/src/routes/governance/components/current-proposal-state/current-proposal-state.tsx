import { ProposalState } from '@vegaprotocol/types';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: Proposal_proposal;
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
  return <span className={className}>{state}</span>;
};
