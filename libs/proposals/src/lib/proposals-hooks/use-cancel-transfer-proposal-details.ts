import { type CancelTransferFieldsFragment } from '../proposals-data-provider';
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

  const proposal = data?.proposal;

  if (
    proposal?.__typename === 'Proposal' &&
    proposal.terms.change.__typename === 'CancelTransfer'
  ) {
    return proposal.terms.change as CancelTransferFieldsFragment;
  }

  if (proposal?.__typename === 'BatchProposal') {
    const p = proposal.subProposals?.find((sub) => sub?.id === proposalId);
    if (p && p.terms?.change.__typename === 'CancelTransfer') {
      return p.terms.change as CancelTransferFieldsFragment;
    }
  }

  return undefined;
};
