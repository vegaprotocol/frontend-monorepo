import { ProposalState } from '../../../../__generated__/globalTypes';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: Proposals_proposals;
}) => {
  const { state } = proposal;
  let className = 'text-white';

  if (
    state === ProposalState.Declined ||
    state === ProposalState.Failed ||
    state === ProposalState.Rejected
  ) {
    className = 'text-intent-danger';
  } else if (
    state === ProposalState.Enacted ||
    state === ProposalState.Passed
  ) {
    className = 'text-white';
  }
  return <span className={className}>{state}</span>;
};
