import { Schema } from '@vegaprotocol/types';
import type { ProposalFieldsFragment } from '@vegaprotocol/governance';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment;
}) => {
  const { state } = proposal;
  let className = 'text-white';

  if (
    state === Schema.ProposalState.STATE_DECLINED ||
    state === Schema.ProposalState.STATE_FAILED ||
    state === Schema.ProposalState.STATE_REJECTED
  ) {
    className = 'text-danger';
  } else if (
    state === Schema.ProposalState.STATE_ENACTED ||
    state === Schema.ProposalState.STATE_PASSED
  ) {
    className = 'text-white';
  }
  return <span className={className}>{state}</span>;
};
