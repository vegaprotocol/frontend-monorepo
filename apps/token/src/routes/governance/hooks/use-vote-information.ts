import { useNetworkParams, NetworkParams } from '@vegaprotocol/react-helpers';
import React from 'react';

import { useAppState } from '../../../contexts/app-state/app-state-context';
import { BigNumber } from '../../../lib/bignumber';
import { addDecimal } from '../../../lib/decimals';
import type {
  ProposalFields,
  ProposalFields_votes_no_votes,
  ProposalFields_votes_yes_votes,
} from '../__generated__/ProposalFields';

const useProposalNetworkParams = ({
  proposal,
}: {
  proposal: ProposalFields;
}) => {
  const { params } = useNetworkParams([
    NetworkParams.governance_proposal_updateMarket_requiredMajority,
    NetworkParams.governance_proposal_updateMarket_requiredParticipation,
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
      requiredParticipation: new BigNumber(1),
    };
  }

  switch (proposal.terms.change.__typename) {
    case 'UpdateMarket':
      return {
        requiredMajority:
          params.governance_proposal_updateMarket_requiredMajority,
        requiredParticipation: new BigNumber(
          params.governance_proposal_updateMarket_requiredParticipation
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
  proposal: ProposalFields;
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
      (prevValue: BigNumber, newValue: ProposalFields_votes_no_votes) => {
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
      (prevValue: BigNumber, newValue: ProposalFields_votes_yes_votes) => {
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
    const tokensNeeded = totalSupply.multipliedBy(requiredParticipation);
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
    requiredParticipation: new BigNumber(requiredParticipation).times(100),
    majorityMet,
  };
};
