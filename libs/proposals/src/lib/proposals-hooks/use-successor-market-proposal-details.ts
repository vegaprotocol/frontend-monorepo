import omit from 'lodash/omit';
import {
  useInstrumentDetailsQuery,
  useSuccessorMarketProposalDetailsQuery,
  type SuccessorMarketProposalDetailsQuery,
} from './__generated__/Proposal';

export const useSuccessorMarketProposalDetails = (
  proposalId?: string | null
) => {
  const { data } = useSuccessorMarketProposalDetailsQuery({
    variables: {
      proposalId: proposalId || '',
    },
    skip: !proposalId || proposalId.length === 0,
  });

  const proposal = data?.proposal as Extract<
    SuccessorMarketProposalDetailsQuery['proposal'],
    { __typename?: 'Proposal' }
  >;

  const successorDetails =
    (proposal &&
      proposal?.terms.change.__typename === 'NewMarket' &&
      proposal.terms.change.successorConfiguration) ||
    undefined;

  const { data: market } = useInstrumentDetailsQuery({
    variables: {
      marketId: successorDetails?.parentMarketId || '',
    },
    skip:
      !successorDetails?.parentMarketId ||
      successorDetails.parentMarketId.length === 0,
  });

  const details = {
    ...successorDetails,
    code: market?.market?.tradableInstrument.instrument.code,
    name: market?.market?.tradableInstrument.instrument.name,
  };

  return omit(details, '__typename');
};
