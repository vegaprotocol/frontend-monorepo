import { type NewTransferFieldsFragment } from '../proposals-data-provider';
import { useNewTransferDetailsQuery } from './__generated__/Proposal';

export const useNewTransferProposalDetails = (proposalId?: string | null) => {
  const { data } = useNewTransferDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  const proposal = data?.proposal;

  if (
    proposal?.__typename === 'Proposal' &&
    proposal.terms.change.__typename === 'NewTransfer'
  ) {
    return proposal?.terms.change as NewTransferFieldsFragment;
  }

  if (proposal?.__typename === 'BatchProposal') {
    const p = proposal.subProposals?.find((sub) => sub?.id === proposalId);
    if (p && p.terms?.change.__typename === 'NewTransfer') {
      return p.terms.change as NewTransferFieldsFragment;
    }
  }

  return undefined;
};
