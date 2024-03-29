import { type SingleProposal } from '../../types';
import { type CancelTransferFieldsFragment } from '../proposals-data-provider';
import {
  useCancelTransferDetailsQuery,
  type CancelTransferDetailsQuery,
} from './__generated__/Proposal';

export const useCancelTransferProposalDetails = (
  proposalId?: string | null
) => {
  const { data } = useCancelTransferDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  const proposal = data?.proposal as SingleProposal<
    CancelTransferDetailsQuery['proposal']
  >;

  if (proposal?.terms.change.__typename === 'CancelTransfer') {
    return proposal?.terms.change as CancelTransferFieldsFragment;
  }

  return undefined;
};
