import type { NewTransferFieldsFragment } from '../proposals-data-provider';
import { useNewTransferDetailsQuery } from './__generated__/Proposal';

export const useNewTransferProposalDetails = (proposalId?: string | null) => {
  const { data } = useNewTransferDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  if (data?.proposal?.terms.change.__typename === 'NewTransfer') {
    return data?.proposal?.terms.change as NewTransferFieldsFragment;
  }

  return undefined;
};
