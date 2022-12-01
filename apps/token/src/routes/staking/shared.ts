import { removePaginationWrapper, toBigNum } from '@vegaprotocol/react-helpers';
import type { PreviousEpochQuery } from './__generated___/PreviousEpoch';

export const rawValidatorScore = (
  previousEpochData: PreviousEpochQuery | undefined,
  id: string
) => {
  return previousEpochData
    ? removePaginationWrapper(
        previousEpochData.epoch?.validatorsConnection?.edges
      ).find((validator) => validator?.id === id)?.rewardScore
        ?.rawValidatorScore
    : null;
};

export const normalisedVotingPower = (votingPower: string) => {
  return toBigNum(votingPower, 0).dividedBy(100).dp(2).toString() + '%';
};
