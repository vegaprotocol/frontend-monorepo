import { useMemo } from 'react';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { useProposalNetworkParams } from './use-proposal-network-params';
import type { Proposal_proposal } from '../proposal/__generated__/Proposal';

export const useVoteInformation = ({
  proposal,
}: {
  proposal: Proposal_proposal;
}) => {
  const {
    appState: { totalSupply },
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
  } = useMemo(
    () => ({
      requiredMajorityPercentage: requiredMajority
        ? new BigNumber(requiredMajority).times(100)
        : new BigNumber(100),
      requiredMajorityLPPercentage: requiredMajorityLP
        ? new BigNumber(requiredMajorityLP).times(100)
        : new BigNumber(100),
      noTokens: new BigNumber(proposal.votes.no.totalTokens),
      noEquityLikeShareWeight: !proposal.votes.no.totalEquityLikeShareWeight
        ? new BigNumber(0)
        : new BigNumber(proposal.votes.no.totalEquityLikeShareWeight),
      yesTokens: new BigNumber(proposal.votes.yes.totalTokens),
      yesEquityLikeShareWeight: !proposal.votes.yes.totalEquityLikeShareWeight
        ? new BigNumber(0)
        : new BigNumber(proposal.votes.yes.totalEquityLikeShareWeight),
    }),
    [
      proposal.votes.no.totalEquityLikeShareWeight,
      proposal.votes.no.totalTokens,
      proposal.votes.yes.totalEquityLikeShareWeight,
      proposal.votes.yes.totalTokens,
      requiredMajority,
      requiredMajorityLP,
    ]
  );

  const { totalTokensVoted, totalEquityLikeShareWeight } = useMemo(
    () => ({
      totalTokensVoted: yesTokens.plus(noTokens),
      totalEquityLikeShareWeight: yesEquityLikeShareWeight.plus(
        noEquityLikeShareWeight
      ),
    }),
    [noEquityLikeShareWeight, noTokens, yesEquityLikeShareWeight, yesTokens]
  );

  const {
    yesPercentage,
    yesLPPercentage,
    noPercentage,
    noLPPercentage,
    participationMet,
    participationLPMet,
  } = useMemo(
    () => ({
      yesPercentage: totalTokensVoted.isZero()
        ? new BigNumber(0)
        : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted),
      yesLPPercentage: totalEquityLikeShareWeight.isZero()
        ? new BigNumber(0)
        : yesEquityLikeShareWeight
            .multipliedBy(100)
            .dividedBy(totalEquityLikeShareWeight),
      noPercentage: totalTokensVoted.isZero()
        ? new BigNumber(0)
        : noTokens.multipliedBy(100).dividedBy(totalTokensVoted),
      noLPPercentage: totalEquityLikeShareWeight.isZero()
        ? new BigNumber(0)
        : noEquityLikeShareWeight
            .multipliedBy(100)
            .dividedBy(totalEquityLikeShareWeight),
      participationMet: totalTokensVoted.isGreaterThan(
        totalSupply.multipliedBy(requiredParticipation)
      ),
      participationLPMet: requiredParticipationLP
        ? totalEquityLikeShareWeight.isGreaterThan(
            totalSupply.multipliedBy(requiredParticipationLP)
          )
        : false,
    }),
    [
      noEquityLikeShareWeight,
      noTokens,
      requiredParticipation,
      requiredParticipationLP,
      totalEquityLikeShareWeight,
      totalSupply,
      totalTokensVoted,
      yesEquityLikeShareWeight,
      yesTokens,
    ]
  );

  const {
    majorityMet,
    majorityLPMet,
    totalTokensPercentage,
    totalLPTokensPercentage,
    willPassByTokenVote,
    willPassByLPVote,
  } = useMemo(
    () => ({
      majorityMet: yesPercentage.isGreaterThanOrEqualTo(
        requiredMajorityPercentage
      ),
      majorityLPMet: yesLPPercentage.isGreaterThanOrEqualTo(
        requiredMajorityLPPercentage
      ),
      totalTokensPercentage: totalTokensVoted
        .multipliedBy(100)
        .dividedBy(totalSupply),
      totalLPTokensPercentage: totalEquityLikeShareWeight
        .multipliedBy(100)
        .dividedBy(totalSupply),
      willPassByTokenVote:
        participationMet &&
        new BigNumber(yesPercentage).isGreaterThanOrEqualTo(
          requiredMajorityPercentage
        ),
      willPassByLPVote:
        participationLPMet &&
        new BigNumber(yesLPPercentage).isGreaterThanOrEqualTo(
          requiredMajorityLPPercentage
        ),
    }),
    [
      participationLPMet,
      participationMet,
      requiredMajorityLPPercentage,
      requiredMajorityPercentage,
      totalEquityLikeShareWeight,
      totalSupply,
      totalTokensVoted,
      yesLPPercentage,
      yesPercentage,
    ]
  );

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
