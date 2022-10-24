import { useNetworkParams, NetworkParams } from '@vegaprotocol/react-helpers';
import React from 'react';

import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import type { Proposal_proposal } from '../proposal/__generated__/Proposal';

const useProposalNetworkParams = ({
  proposal,
}: {
  proposal: Proposal_proposal;
}) => {
  const { params } = useNetworkParams([
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredMajorityLP,
    NetworkParams.governance_proposal_updateMarket_requiredParticipation,
    NetworkParams.governance_proposal_updateMarket_requiredParticipationLP,
    NetworkParams.governance_proposal_market_requiredMajority,
    NetworkParams.governance_proposal_market_requiredParticipation,
    NetworkParams.governance_proposal_asset_requiredMajority,
    NetworkParams.governance_proposal_asset_requiredParticipation,
    NetworkParams.governance_proposal_updateNetParam_requiredMajority,
    NetworkParams.governance_proposal_updateNetParam_requiredParticipation,
    NetworkParams.governance_proposal_freeform_requiredMajority,
    NetworkParams.governance_proposal_freeform_requiredParticipation,
  ]);

  if (!params) {
    return {
      requiredMajority: new BigNumber(1),
      requiredMajorityLP: new BigNumber(0),
      requiredParticipation: new BigNumber(1),
      requiredParticipationLP: new BigNumber(0),
    };
  }

  switch (proposal.terms.change.__typename) {
    case 'UpdateMarket':
      return {
        requiredMajority:
          params.governance_proposal_updateMarket_requiredMajority,
        requiredMajorityLP:
          params.governance_proposal_updateMarket_requiredMajorityLP,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateMarket_requiredParticipation
        ),
        requiredParticipationLP: new BigNumber(
          params.governance_proposal_updateMarket_requiredParticipationLP
        ),
      };
    case 'UpdateNetworkParameter':
      return {
        requiredMajority:
          params.governance_proposal_updateNetParam_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateNetParam_requiredParticipation
        ),
      };
    case 'NewAsset':
      return {
        requiredMajority: params.governance_proposal_asset_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_asset_requiredParticipation
        ),
      };
    case 'NewMarket':
      return {
        requiredMajority: params.governance_proposal_market_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_market_requiredParticipation
        ),
      };
    case 'NewFreeform':
      return {
        requiredMajority: params.governance_proposal_freeform_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_freeform_requiredParticipation
        ),
      };
    default:
      throw new Error('Unknown proposal type');
  }
};

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

  const requiredMajorityPercentage = React.useMemo(
    () =>
      requiredMajority
        ? new BigNumber(requiredMajority).times(100)
        : new BigNumber(100),
    [requiredMajority]
  );

  const requiredMajorityLPPercentage = React.useMemo(
    () =>
      requiredMajorityLP
        ? new BigNumber(requiredMajorityLP).times(100)
        : new BigNumber(100),
    [requiredMajorityLP]
  );

  const noTokens = React.useMemo(() => {
    return new BigNumber(proposal.votes.no.totalTokens);
  }, [proposal.votes.no.totalTokens]);

  const noLPTokens = React.useMemo(() => {
    if (!proposal.votes.no.totalEquityLikeShareWeight) {
      return new BigNumber(0);
    }

    return new BigNumber(proposal.votes.no.totalEquityLikeShareWeight);
  }, [proposal.votes.no.totalEquityLikeShareWeight]);

  const yesTokens = React.useMemo(() => {
    return new BigNumber(proposal.votes.yes.totalTokens);
  }, [proposal.votes.yes.totalTokens]);

  const yesLPTokens = React.useMemo(() => {
    if (!proposal.votes.yes.totalEquityLikeShareWeight) {
      return new BigNumber(0);
    }

    return new BigNumber(proposal.votes.yes.totalEquityLikeShareWeight);
  }, [proposal.votes.yes.totalEquityLikeShareWeight]);

  const totalTokensVoted = React.useMemo(
    () => yesTokens.plus(noTokens),
    [yesTokens, noTokens]
  );

  const totalLPTokensVoted = React.useMemo(
    () => yesLPTokens.plus(noLPTokens),
    [yesLPTokens, noLPTokens]
  );

  const yesPercentage = React.useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [totalTokensVoted, yesTokens]
  );

  const yesLPPercentage = React.useMemo(
    () =>
      totalLPTokensVoted.isZero()
        ? new BigNumber(0)
        : yesLPTokens.multipliedBy(100).dividedBy(totalLPTokensVoted),
    [totalLPTokensVoted, yesLPTokens]
  );

  const noPercentage = React.useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : noTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [noTokens, totalTokensVoted]
  );

  const noLPPercentage = React.useMemo(
    () =>
      totalLPTokensVoted.isZero()
        ? new BigNumber(0)
        : noLPTokens.multipliedBy(100).dividedBy(totalLPTokensVoted),
    [noLPTokens, totalLPTokensVoted]
  );

  const participationMet = React.useMemo(() => {
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipation);
    return totalTokensVoted.isGreaterThan(tokensNeeded);
  }, [requiredParticipation, totalTokensVoted, totalSupply]);

  const participationLPMet = React.useMemo(() => {
    if (!requiredParticipationLP) {
      return false;
    }
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipationLP);
    return totalLPTokensVoted.isGreaterThan(tokensNeeded);
  }, [requiredParticipationLP, totalLPTokensVoted, totalSupply]);

  const majorityMet = React.useMemo(() => {
    return yesPercentage.isGreaterThanOrEqualTo(requiredMajorityPercentage);
  }, [yesPercentage, requiredMajorityPercentage]);

  const majorityLPMet = React.useMemo(() => {
    return yesLPPercentage.isGreaterThanOrEqualTo(requiredMajorityLPPercentage);
  }, [yesLPPercentage, requiredMajorityLPPercentage]);

  const totalTokensPercentage = React.useMemo(() => {
    return totalTokensVoted.multipliedBy(100).dividedBy(totalSupply);
  }, [totalTokensVoted, totalSupply]);

  const totalLPTokensPercentage = React.useMemo(() => {
    return totalLPTokensVoted.multipliedBy(100).dividedBy(totalSupply);
  }, [totalLPTokensVoted, totalSupply]);

  const willPassByTokenVote = React.useMemo(
    () =>
      participationMet &&
      new BigNumber(yesPercentage).isGreaterThanOrEqualTo(
        requiredMajorityPercentage
      ),
    [participationMet, requiredMajorityPercentage, yesPercentage]
  );

  const willPassLP = React.useMemo(
    () =>
      participationLPMet &&
      new BigNumber(yesLPPercentage).isGreaterThanOrEqualTo(
        requiredMajorityLPPercentage
      ),
    [participationLPMet, requiredMajorityLPPercentage, yesLPPercentage]
  );

  return {
    willPassByTokenVote,
    willPassLP,
    totalTokensPercentage,
    totalLPTokensPercentage,
    participationMet,
    participationLPMet,
    totalTokensVoted,
    totalLPTokensVoted,
    noPercentage,
    noLPPercentage,
    yesPercentage,
    yesLPPercentage,
    noTokens,
    noLPTokens,
    yesTokens,
    yesLPTokens,
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
