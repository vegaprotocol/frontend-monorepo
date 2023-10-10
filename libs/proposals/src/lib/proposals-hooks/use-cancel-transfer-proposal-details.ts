import type { CancelTransferFieldsFragment } from '../proposals-data-provider';
import { useCancelTransferDetailsQuery } from './__generated__/Proposal';

export const useCancelTransferProposalDetails = (
  proposalId?: string | null
) => {
  const { data } = useCancelTransferDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  if (data?.proposal?.terms.change.__typename === 'CancelTransfer') {
    return data?.proposal?.terms.change as CancelTransferFieldsFragment;
  }

  return undefined;
};
