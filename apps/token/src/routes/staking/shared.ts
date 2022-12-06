import { removePaginationWrapper, toBigNum } from '@vegaprotocol/react-helpers';
import type { PreviousEpochQuery } from './__generated___/PreviousEpoch';
import { BigNumber } from '../../lib/bignumber';

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

export const unnormalisedVotingPower = (
  validatorScore: string | null | undefined
) =>
  validatorScore
    ? new BigNumber(validatorScore).times(100).dp(2).toString() + '%'
    : null;
