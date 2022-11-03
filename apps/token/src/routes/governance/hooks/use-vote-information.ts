import { useMemo } from 'react';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { useProposalNetworkParams } from './use-proposal-network-params';
import type { Proposal_proposal } from '../proposal/__generated__/Proposal';
import { removeDecimal } from '@vegaprotocol/react-helpers';

export const useVoteInformation = ({
  proposal,
}: {
  proposal: Proposal_proposal;
}) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();

  const {
    requiredMajority,
    requiredParticipation,
    requiredMajorityLP,
    requiredParticipationLP,
  } = useProposalNetworkParams({
    proposal,
  });

  const {
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
  } = useMemo(() => {
    const requiredMajorityPercentage = requiredMajority
      ? new BigNumber(requiredMajority).times(100)
      : new BigNumber(100);

    const requiredMajorityLPPercentage = requiredMajorityLP
      ? new BigNumber(requiredMajorityLP).times(100)
      : new BigNumber(100);

    const noTokens = new BigNumber(
      removeDecimal(proposal.votes.no.totalTokens, decimals)
    );

    const noEquityLikeShareWeight = !proposal.votes.no
      .totalEquityLikeShareWeight
      ? new BigNumber(0)
      : new BigNumber(proposal.votes.no.totalEquityLikeShareWeight);

    const yesTokens = new BigNumber(
      removeDecimal(proposal.votes.yes.totalTokens, decimals)
    );

    const yesEquityLikeShareWeight = !proposal.votes.yes
      .totalEquityLikeShareWeight
      ? new BigNumber(0)
      : new BigNumber(proposal.votes.yes.totalEquityLikeShareWeight);

    const totalTokensVoted = yesTokens.plus(noTokens);

    const totalEquityLikeShareWeight = yesEquityLikeShareWeight.plus(
      noEquityLikeShareWeight
    );

    const yesPercentage = totalTokensVoted.isZero()
      ? new BigNumber(0)
      : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted);

    const yesLPPercentage = totalEquityLikeShareWeight.isZero()
      ? new BigNumber(0)
      : yesEquityLikeShareWeight
          .multipliedBy(100)
          .dividedBy(totalEquityLikeShareWeight);

    const noPercentage = totalTokensVoted.isZero()
      ? new BigNumber(0)
      : noTokens.multipliedBy(100).dividedBy(totalTokensVoted);

    const noLPPercentage = totalEquityLikeShareWeight.isZero()
      ? new BigNumber(0)
      : noEquityLikeShareWeight
          .multipliedBy(100)
          .dividedBy(totalEquityLikeShareWeight);

    const participationMet = totalTokensVoted.isGreaterThan(
      totalSupply.multipliedBy(requiredParticipation)
    );

    const participationLPMet = requiredParticipationLP
      ? totalEquityLikeShareWeight.isGreaterThan(
          totalSupply.multipliedBy(requiredParticipationLP)
        )
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

    const totalLPTokensPercentage = totalEquityLikeShareWeight
      .multipliedBy(100)
      .dividedBy(totalSupply);

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
    };
  }, [
    decimals,
    proposal.votes.no.totalEquityLikeShareWeight,
    proposal.votes.no.totalTokens,
    proposal.votes.yes.totalEquityLikeShareWeight,
    proposal.votes.yes.totalTokens,
    requiredMajority,
    requiredMajorityLP,
    requiredParticipation,
    requiredParticipationLP,
    totalSupply,
  ]);

  return {
    willPassByTokenVote,
    willPassByLPVote,
    totalTokensPercentage,
    totalLPTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    totalEquityLikeShareWeight,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    noTokens,
    noEquityLikeShareWeight,
    yesTokens,
    yesEquityLikeShareWeight,
    yesVotes: new BigNumber(proposal.votes.yes.totalNumber),
    noVotes: new BigNumber(proposal.votes.no.totalNumber),
    totalVotes: new BigNumber(proposal.votes.yes.totalNumber).plus(
      proposal.votes.no.totalNumber
    ),
    requiredMajorityPercentage,
    requiredMajorityLPPercentage,
    requiredParticipation: new BigNumber(requiredParticipation).times(100),
    requiredParticipationLP:
      requiredParticipationLP &&
      new BigNumber(requiredParticipationLP).times(100),
    majorityMet,
    majorityLPMet,
  };
};
