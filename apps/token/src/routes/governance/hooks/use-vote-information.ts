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

  const requiredMajorityPercentage = useMemo(
    () =>
      requiredMajority
        ? new BigNumber(requiredMajority).times(100)
        : new BigNumber(100),
    [requiredMajority]
  );

  const requiredMajorityLPPercentage = useMemo(
    () =>
      requiredMajorityLP
        ? new BigNumber(requiredMajorityLP).times(100)
        : new BigNumber(100),
    [requiredMajorityLP]
  );

  const noTokens = useMemo(() => {
    return new BigNumber(proposal.votes.no.totalTokens);
  }, [proposal.votes.no.totalTokens]);

  const noELSWeight = useMemo(() => {
    if (!proposal.votes.no.totalEquityLikeShareWeight) {
      return new BigNumber(0);
    }

    return new BigNumber(proposal.votes.no.totalEquityLikeShareWeight);
  }, [proposal.votes.no.totalEquityLikeShareWeight]);

  const yesTokens = useMemo(() => {
    return new BigNumber(proposal.votes.yes.totalTokens);
  }, [proposal.votes.yes.totalTokens]);

  const yesELSWeight = useMemo(() => {
    if (!proposal.votes.yes.totalEquityLikeShareWeight) {
      return new BigNumber(0);
    }

    return new BigNumber(proposal.votes.yes.totalEquityLikeShareWeight);
  }, [proposal.votes.yes.totalEquityLikeShareWeight]);

  const totalTokensVoted = useMemo(
    () => yesTokens.plus(noTokens),
    [yesTokens, noTokens]
  );

  const totalELSWeight = useMemo(
    () => yesELSWeight.plus(noELSWeight),
    [yesELSWeight, noELSWeight]
  );

  const yesPercentage = useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [totalTokensVoted, yesTokens]
  );

  const yesLPPercentage = useMemo(
    () =>
      totalELSWeight.isZero()
        ? new BigNumber(0)
        : yesELSWeight.multipliedBy(100).dividedBy(totalELSWeight),
    [totalELSWeight, yesELSWeight]
  );

  const noPercentage = useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : noTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [noTokens, totalTokensVoted]
  );

  const noLPPercentage = useMemo(
    () =>
      totalELSWeight.isZero()
        ? new BigNumber(0)
        : noELSWeight.multipliedBy(100).dividedBy(totalELSWeight),
    [noELSWeight, totalELSWeight]
  );

  const participationMet = useMemo(() => {
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipation);
    return totalTokensVoted.isGreaterThan(tokensNeeded);
  }, [requiredParticipation, totalTokensVoted, totalSupply]);

  const participationLPMet = useMemo(() => {
    if (!requiredParticipationLP) {
      return false;
    }
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipationLP);
    return totalELSWeight.isGreaterThan(tokensNeeded);
  }, [requiredParticipationLP, totalELSWeight, totalSupply]);

  const majorityMet = useMemo(() => {
    return yesPercentage.isGreaterThanOrEqualTo(requiredMajorityPercentage);
  }, [yesPercentage, requiredMajorityPercentage]);

  const majorityLPMet = useMemo(() => {
    return yesLPPercentage.isGreaterThanOrEqualTo(requiredMajorityLPPercentage);
  }, [yesLPPercentage, requiredMajorityLPPercentage]);

  const totalTokensPercentage = useMemo(() => {
    return totalTokensVoted.multipliedBy(100).dividedBy(totalSupply);
  }, [totalTokensVoted, totalSupply]);

  const totalLPTokensPercentage = useMemo(() => {
    return totalELSWeight.multipliedBy(100).dividedBy(totalSupply);
  }, [totalELSWeight, totalSupply]);

  const willPassByTokenVote = useMemo(
    () =>
      participationMet &&
      new BigNumber(yesPercentage).isGreaterThanOrEqualTo(
        requiredMajorityPercentage
      ),
    [participationMet, requiredMajorityPercentage, yesPercentage]
  );

  const willPassByLPVote = useMemo(
    () =>
      participationLPMet &&
      new BigNumber(yesLPPercentage).isGreaterThanOrEqualTo(
        requiredMajorityLPPercentage
      ),
    [participationLPMet, requiredMajorityLPPercentage, yesLPPercentage]
  );

  return {
    willPassByTokenVote,
    willPassByLPVote,
    totalTokensPercentage,
    totalLPTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    totalELSWeight,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    noTokens,
    noELSWeight,
    yesTokens,
    yesELSWeight,
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
