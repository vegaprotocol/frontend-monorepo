import { ProposalState } from '@vegaprotocol/types';
import type { ProposalFields } from '../../__generated__/ProposalFields';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: ProposalFields;
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
