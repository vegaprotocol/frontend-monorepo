import compact from 'lodash/compact';
import { useMemo } from 'react';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import {
  useProposalNetworkParams,
  useBatchProposalNetworkParams,
} from './use-proposal-network-params';
import { addDecimal } from '@vegaprotocol/utils';
import { type BatchProposal, type Proposal } from '../types';
import {
  ProposalFieldsFragment,
  ProposalTermsFieldsFragment,
} from '../__generated__/Proposals';

export const useVoteInformation = ({ proposal }: { proposal: Proposal }) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();

  const params = useProposalNetworkParams({
    terms: proposal.terms,
  });

  return {
    ...getVoteData(params, proposal.votes, totalSupply, decimals),
    yesVotes: new BigNumber(proposal?.votes.yes.totalNumber ?? 0),
    noVotes: new BigNumber(proposal?.votes.no.totalNumber ?? 0),
    totalVotes: new BigNumber(proposal?.votes.yes.totalNumber ?? 0).plus(
      proposal?.votes.no.totalNumber ?? 0
    ),
    requiredParticipation: new BigNumber(params.requiredParticipation).times(
      100
    ),
    requiredParticipationLP:
      params.requiredParticipationLP &&
      new BigNumber(params.requiredParticipationLP).times(100),
  };
};
export const useBatchVoteInformation = ({
  proposal,
}: {
  proposal: BatchProposal;
}) => {
  const {
    appState: { totalSupply, decimals },
  } = useAppState();

  const subProposalTerms = compact(
    proposal.subProposals?.map((sp) => sp?.terms)
  );

  const params = useBatchProposalNetworkParams({
    terms: subProposalTerms,
  });

  if (!params) return;

  if (subProposalTerms.length !== params.length) {
    throw new Error('sub proposals are missing params');
  }

  const voteData = [];

  for (let i = 0; i < subProposalTerms.length; i++) {
    const terms = subProposalTerms[i];
    const paramsForTerms = params[i];

    voteData.push({
      ...getVoteData(paramsForTerms, proposal.votes, totalSupply, decimals),
      yesVotes: new BigNumber(proposal?.votes.yes.totalNumber ?? 0),
      noVotes: new BigNumber(proposal?.votes.no.totalNumber ?? 0),
      totalVotes: new BigNumber(proposal?.votes.yes.totalNumber ?? 0).plus(
        proposal?.votes.no.totalNumber ?? 0
      ),
      requiredParticipation: new BigNumber(
        paramsForTerms.requiredParticipation
      ).times(100),
      requiredParticipationLP:
        paramsForTerms.requiredParticipationLP &&
        new BigNumber(paramsForTerms.requiredParticipationLP).times(100),
    });
  }

  return voteData;
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
  };
};
