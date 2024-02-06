import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { useProposalNetworkParams } from './use-proposal-network-params';
import { addDecimal } from '@vegaprotocol/utils';
import {
  type ProposalTermsFieldsFragment,
  type ProposalFieldsFragment,
  type VoteFieldsFragment,
} from '../__generated__/Proposals';

export const useVoteInformation = ({
  votes,
  terms,
}: {
  votes: VoteFieldsFragment;
  terms: ProposalTermsFieldsFragment;
}) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();

  const params = useProposalNetworkParams();

  if (!params) return;

  const paramsForChange = params[terms.change.__typename];

  return getVoteData(paramsForChange, votes, totalSupply, decimals);
};

const getVoteData = (
  params: {
    requiredMajority: BigNumber;
    requiredMajorityLP: BigNumber;
    requiredParticipation: BigNumber;
    requiredParticipationLP: BigNumber;
  },
  votes: ProposalFieldsFragment['votes'],
  totalSupply: BigNumber,
  decimals: number
) => {
  const requiredMajorityPercentage = params.requiredMajority
    ? new BigNumber(params.requiredMajority).times(100)
    : new BigNumber(100);

  const requiredMajorityLPPercentage = params.requiredMajorityLP
    ? new BigNumber(params.requiredMajorityLP).times(100)
    : new BigNumber(100);

  const noTokens = new BigNumber(
    addDecimal(votes.no.totalTokens ?? 0, decimals)
  );

  const noEquityLikeShareWeight = !votes.no.totalEquityLikeShareWeight
    ? new BigNumber(0)
    : new BigNumber(votes.no.totalEquityLikeShareWeight).times(100);

  const yesTokens = new BigNumber(
    addDecimal(votes.yes.totalTokens ?? 0, decimals)
  );

  const yesEquityLikeShareWeight = !votes.yes.totalEquityLikeShareWeight
    ? new BigNumber(0)
    : new BigNumber(votes.yes.totalEquityLikeShareWeight).times(100);

  const totalTokensVoted = yesTokens.plus(noTokens);

  const totalEquityLikeShareWeight = yesEquityLikeShareWeight.plus(
    noEquityLikeShareWeight
  );

  const yesPercentage = totalTokensVoted.isZero()
    ? new BigNumber(0)
    : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted);
  const yesLPPercentage = yesEquityLikeShareWeight;

  const noPercentage = totalTokensVoted.isZero()
    ? new BigNumber(0)
    : noTokens.multipliedBy(100).dividedBy(totalTokensVoted);

  const noLPPercentage = totalEquityLikeShareWeight.isZero()
    ? new BigNumber(0)
    : noEquityLikeShareWeight
        .multipliedBy(100)
        .dividedBy(totalEquityLikeShareWeight);

  const participationMet = totalTokensVoted.isGreaterThan(
    totalSupply.multipliedBy(params.requiredParticipation)
  );

  const participationLPMet = params.requiredParticipationLP
    ? totalEquityLikeShareWeight.isGreaterThan(params.requiredParticipationLP)
    : false;

  const majorityMet = yesPercentage.isGreaterThanOrEqualTo(
    requiredMajorityPercentage
  );

  const majorityLPMet = yesLPPercentage.isGreaterThanOrEqualTo(
    requiredMajorityLPPercentage
  );

  const totalTokensPercentage = totalTokensVoted
    .multipliedBy(100)
    .dividedBy(totalSupply);

  const totalLPTokensPercentage = totalEquityLikeShareWeight;

  const willPassByTokenVote =
    participationMet &&
    new BigNumber(yesPercentage).isGreaterThanOrEqualTo(
      requiredMajorityPercentage
    );

  const willPassByLPVote =
    participationLPMet &&
    new BigNumber(yesLPPercentage).isGreaterThanOrEqualTo(
      requiredMajorityLPPercentage
    );

  return {
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    noTokens,
    noEquityLikeShareWeight,
    yesTokens,
    yesEquityLikeShareWeight,
    totalTokensVoted,
    totalEquityLikeShareWeight,
    yesPercentage,
    yesLPPercentage,
    noPercentage,
    noLPPercentage,
    participationMet,
    participationLPMet,
    majorityMet,
    majorityLPMet,
    totalTokensPercentage,
    totalLPTokensPercentage,
    willPassByTokenVote,
    willPassByLPVote,
    yesVotes: new BigNumber(votes.yes.totalNumber ?? 0),
    noVotes: new BigNumber(votes.no.totalNumber ?? 0),
    totalVotes: new BigNumber(votes.yes.totalNumber ?? 0).plus(
      votes.no.totalNumber ?? 0
    ),
    requiredParticipation: new BigNumber(params.requiredParticipation).times(
      100
    ),
    requiredParticipationLP: new BigNumber(
      params.requiredParticipationLP
    ).times(100),
  };
};
