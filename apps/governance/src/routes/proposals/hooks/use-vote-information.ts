import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { addDecimal } from '@vegaprotocol/utils';
import {
  type ProposalTermsFieldsFragment,
  type ProposalFieldsFragment,
  type VoteFieldsFragment,
} from '../__generated__/Proposals';
import { type ProposalChangeType } from '../types';
import sum from 'lodash/sum';
import { type ProposalNode } from '../../../routes/proposals/components/proposal/proposal-utils';

export const useVoteInformation = ({
  votes,
  terms,
  yesELS,
  noELS,
  restData,
}: {
  votes: VoteFieldsFragment;
  terms: ProposalTermsFieldsFragment;
  yesELS?: number[];
  noELS?: number[];
  restData?: ProposalNode | null;
}) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();
  if (!restData) return;

  return getVoteData(
    terms.change.__typename,
    votes,
    totalSupply,
    restData,
    decimals,
    yesELS,
    noELS
  );
};

export const useBatchVoteInformation = ({
  votes,
  terms,
  restData,
}: {
  votes: VoteFieldsFragment;
  terms: ProposalTermsFieldsFragment[];
  restData?: ProposalNode | null;
}) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();

  if (!restData) return;

  return terms.map((t) => {
    return getVoteData(
      t.change.__typename,
      votes,
      totalSupply,
      restData,
      decimals
    );
  });
};

const getVoteData = (
  changeType: ProposalChangeType,
  votes: ProposalFieldsFragment['votes'],
  totalSupply: BigNumber,
  restData: ProposalNode,
  decimals: number,
  /** A list of ELS yes votes */
  yesELS?: number[],
  /** A list if ELS no votes */
  noELS?: number[]
) => {
  const requiredMajority = restData.proposal.requiredMajority;
  const requiredMajorityPercentage = requiredMajority
    ? new BigNumber(requiredMajority).times(100)
    : new BigNumber(100);

  const requiredParticipation = restData.proposal.requiredParticipation;
  const requiredMajorityLPPercentage = requiredParticipation
    ? new BigNumber(requiredParticipation).times(100)
    : new BigNumber(100);

  const noTokens = new BigNumber(
    addDecimal(votes.no.totalTokens ?? 0, decimals)
  );

  let noEquityLikeShareWeight = !votes.no.totalEquityLikeShareWeight
    ? new BigNumber(0)
    : new BigNumber(votes.no.totalEquityLikeShareWeight).times(100);
  // there's no meaningful `totalEquityLikeShareWeight` in batch proposals,
  // it has to be deduced from `elsPerMarket` of `no` votes of given proposal
  // data. (by REST DATA)
  if (noELS != null) {
    const noTotalELS = sum(noELS);
    noEquityLikeShareWeight = new BigNumber(noTotalELS).times(100);
  }

  const yesTokens = new BigNumber(
    addDecimal(votes.yes.totalTokens ?? 0, decimals)
  );

  let yesEquityLikeShareWeight = !votes.yes.totalEquityLikeShareWeight
    ? new BigNumber(0)
    : new BigNumber(votes.yes.totalEquityLikeShareWeight).times(100);
  // there's no meaningful `totalEquityLikeShareWeight` in batch proposals,
  // it has to be deduced from `elsPerMarket` of `yes` votes of given proposal
  // data. (by REST DATA)
  if (noELS != null) {
    const yesTotalELS = sum(yesELS);
    yesEquityLikeShareWeight = new BigNumber(yesTotalELS).times(100);
  }

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
    totalSupply.multipliedBy(requiredParticipation)
  );

  const lpVoteWeight = yesEquityLikeShareWeight
    .dividedBy(totalEquityLikeShareWeight)
    .multipliedBy(100);

  const requiredParticipationLP =
    restData.proposal.requiredLiquidityProviderParticipation;
  const participationLPMet = requiredParticipationLP
    ? lpVoteWeight.isGreaterThan(requiredParticipationLP)
    : false;

  const majorityMet = yesPercentage.isGreaterThanOrEqualTo(
    requiredMajorityPercentage
  );

  const majorityLPMet = lpVoteWeight.isGreaterThanOrEqualTo(
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
    lpVoteWeight.isGreaterThanOrEqualTo(requiredMajorityLPPercentage);

  let willPass = false;

  if (changeType === 'UpdateMarket' || changeType === 'UpdateMarketState') {
    willPass = willPassByTokenVote || willPassByLPVote;
  } else {
    willPass = willPassByTokenVote;
  }

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
    lpVoteWeight: lpVoteWeight.isNaN() ? new BigNumber(0) : lpVoteWeight,
    yesVotes: new BigNumber(votes.yes.totalNumber ?? 0),
    noVotes: new BigNumber(votes.no.totalNumber ?? 0),
    totalVotes: new BigNumber(votes.yes.totalNumber ?? 0).plus(
      votes.no.totalNumber ?? 0
    ),
    requiredParticipation: new BigNumber(requiredParticipation).times(100),
    requiredParticipationLP: new BigNumber(requiredParticipationLP).times(100),
    willPass,
  };
};
