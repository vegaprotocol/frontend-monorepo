import type { NewTransferFieldsFragment } from '../proposals-data-provider';
import {
  useNewTransferDetailsQuery,
  type NewTransferDetailsQuery,
} from './__generated__/Proposal';

export const useNewTransferProposalDetails = (proposalId?: string | null) => {
  const { data } = useNewTransferDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  const proposal = data?.proposal as Extract<
    NewTransferDetailsQuery['proposal'],
    { __typename?: 'Proposal' }
  >;

  if (proposal?.terms.change.__typename === 'NewTransfer') {
    return proposal?.terms.change as NewTransferFieldsFragment;
  }

  return undefined;
};
