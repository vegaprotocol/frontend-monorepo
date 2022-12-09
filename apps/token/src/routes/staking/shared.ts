import {
  formatNumberPercentage,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import type { PreviousEpochQuery } from './__generated___/PreviousEpoch';
import { BigNumber } from '../../lib/bignumber';

export const getRawValidatorScore = (
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

export const getNormalisedVotingPower = (votingPower: string) =>
  formatNumberPercentage(new BigNumber(votingPower).dividedBy(100), 2);

export const getUnnormalisedVotingPower = (
  validatorScore: string | null | undefined
) =>
  validatorScore
    ? formatNumberPercentage(new BigNumber(validatorScore).times(100), 2)
    : null;

export const getFormattedPerformanceScore = (performanceScore: string) =>
  new BigNumber(performanceScore).dp(2);

export const getPerformancePenalty = (performanceScore: string) =>
  formatNumberPercentage(
    new BigNumber(1)
      .minus(getFormattedPerformanceScore(performanceScore))
      .times(100),
    2
  );

export const getOverstakedAmount = (
  validatorScore: string | null | undefined,
  totalStake: string,
  stakedOnNode: string
) => {
  const amount = validatorScore
    ? new BigNumber(validatorScore)
        .times(new BigNumber(totalStake))
        .minus(new BigNumber(stakedOnNode))
        .dp(2)
    : new BigNumber(0);

  return amount.isNegative() ? new BigNumber(0) : amount;
};

export const getOverstakingPenalty = (
  overstakedAmount: BigNumber,
  stakedOnNode: string
) =>
  formatNumberPercentage(
    overstakedAmount.dividedBy(new BigNumber(stakedOnNode)).times(100),
    2
  );

export const getTotalPenalties = (
  rawValidatorScore: string | null | undefined,
  performanceScore: string,
  stakedOnNode: string,
  totalStake: string
) => {
  const calc = rawValidatorScore
    ? new BigNumber(1).minus(
        new BigNumber(performanceScore)
          .times(new BigNumber(rawValidatorScore))
          .dividedBy(
            new BigNumber(stakedOnNode).dividedBy(new BigNumber(totalStake))
          )
      )
    : new BigNumber(0);

  return formatNumberPercentage(
    calc.isPositive() ? calc.times(100) : new BigNumber(0),
    2
  );
};
