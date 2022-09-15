import React from 'react';
import { useNetworkParams } from '@vegaprotocol/react-helpers';
import type { ProposalFieldsFragment } from '@vegaprotocol/governance';

import { NetworkParams } from '../../../config';
import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { addDecimal } from '../../../lib/decimals';

const useProposalNetworkParams = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment;
}) => {
  const { data, loading } = useNetworkParams([
    NetworkParams.GOV_UPDATE_MARKET_REQUIRED_MAJORITY,
    NetworkParams.GOV_UPDATE_MARKET_REQUIRED_PARTICIPATION,
    NetworkParams.GOV_NEW_MARKET_REQUIRED_MAJORITY,
    NetworkParams.GOV_NEW_MARKET_REQUIRED_PARTICIPATION,
    NetworkParams.GOV_ASSET_REQUIRED_MAJORITY,
    NetworkParams.GOV_ASSET_REQUIRED_PARTICIPATION,
    NetworkParams.GOV_UPDATE_NET_PARAM_REQUIRED_MAJORITY,
    NetworkParams.GOV_UPDATE_NET_PARAM_REQUIRED_PARTICIPATION,
    NetworkParams.GOV_FREEFORM_REQUIRED_MAJORITY,
    NetworkParams.GOV_FREEFORM_REQUIRED_PARTICIPATION,
  ]);
  if (loading || !data) {
    return {
      requiredMajority: new BigNumber(1),
      requiredParticipation: new BigNumber(1),
    };
  }

  const [
    updateMarketMajority,
    updateMarketParticipation,
    newMarketMajority,
    newMarketParticipation,
    assetMajority,
    assetParticipation,
    paramMajority,
    paramParticipation,
    freeformMajority,
    freeformParticipation,
  ] = data;

  switch (proposal.terms.change.__typename) {
    case 'UpdateMarket':
      return {
        requiredMajority: updateMarketMajority,
        requiredParticipation: new BigNumber(updateMarketParticipation ?? 0),
      };
    case 'UpdateNetworkParameter':
      return {
        requiredMajority: paramMajority,
        requiredParticipation: new BigNumber(paramParticipation ?? 0),
      };
    case 'NewAsset':
      return {
        requiredMajority: assetMajority,
        requiredParticipation: new BigNumber(assetParticipation ?? 0),
      };
    case 'NewMarket':
      return {
        requiredMajority: newMarketMajority,
        requiredParticipation: new BigNumber(newMarketParticipation ?? 0),
      };
    case 'NewFreeform':
      return {
        requiredMajority: freeformMajority,
        requiredParticipation: freeformParticipation,
      };
    default:
      throw new Error('Unknown proposal type');
  }
};

export const useVoteInformation = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment;
}) => {
  const {
    appState: { totalSupply },
  } = useAppState();

  const { requiredMajority, requiredParticipation } = useProposalNetworkParams({
    proposal,
  });

  const requiredMajorityPercentage = React.useMemo(
    () =>
      requiredMajority
        ? new BigNumber(requiredMajority).times(100)
        : new BigNumber(100),
    [requiredMajority]
  );

  const noTokens = React.useMemo(() => {
    if (!proposal.votes.no.votes) {
      return new BigNumber(0);
    }
    const totalNoVotes = proposal.votes.no.votes.reduce(
      (prevValue: BigNumber, newValue) => {
        return new BigNumber(
          newValue.party.stakingSummary.currentStakeAvailable
        ).plus(prevValue);
      },
      new BigNumber(0)
    );
    return new BigNumber(addDecimal(totalNoVotes, 18));
  }, [proposal.votes.no.votes]);

  const yesTokens = React.useMemo(() => {
    if (!proposal.votes.yes.votes) {
      return new BigNumber(0);
    }
    const totalYesVotes = proposal.votes.yes.votes.reduce(
      (prevValue: BigNumber, newValue) => {
        return new BigNumber(
          newValue.party.stakingSummary.currentStakeAvailable
        ).plus(prevValue);
      },
      new BigNumber(0)
    );
    return new BigNumber(addDecimal(totalYesVotes, 18));
  }, [proposal.votes.yes.votes]);

  const totalTokensVoted = React.useMemo(
    () => yesTokens.plus(noTokens),
    [yesTokens, noTokens]
  );
  const yesPercentage = React.useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [totalTokensVoted, yesTokens]
  );
  const noPercentage = React.useMemo(
    () =>
      totalTokensVoted.isZero()
        ? new BigNumber(0)
        : noTokens.multipliedBy(100).dividedBy(totalTokensVoted),
    [noTokens, totalTokensVoted]
  );
  const participationMet = React.useMemo(() => {
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipation ?? 1);
    return totalTokensVoted.isGreaterThan(tokensNeeded);
  }, [requiredParticipation, totalTokensVoted, totalSupply]);

  const majorityMet = React.useMemo(() => {
    return (
      yesPercentage.isGreaterThanOrEqualTo(requiredMajorityPercentage) ||
      noPercentage.isGreaterThanOrEqualTo(requiredMajorityPercentage)
    );
  }, [yesPercentage, noPercentage, requiredMajorityPercentage]);

  const totalTokensPercentage = React.useMemo(() => {
    return totalTokensVoted.multipliedBy(100).dividedBy(totalSupply);
  }, [totalTokensVoted, totalSupply]);

  const willPass = React.useMemo(
    () =>
      participationMet &&
      new BigNumber(yesPercentage).isGreaterThanOrEqualTo(
        requiredMajorityPercentage
      ),
    [participationMet, requiredMajorityPercentage, yesPercentage]
  );

  return {
    willPass,
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    noTokens,
    yesTokens,
    yesVotes: new BigNumber(proposal.votes.yes.totalNumber),
    noVotes: new BigNumber(proposal.votes.no.totalNumber),
    totalVotes: new BigNumber(proposal.votes.yes.totalNumber).plus(
      proposal.votes.no.totalNumber
    ),
    requiredMajorityPercentage,
    requiredParticipation: new BigNumber(requiredParticipation ?? 0).times(100),
    majorityMet,
  };
};
