import {
  formatNumberPercentage,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import type { PreviousEpochQuery } from './__generated__/PreviousEpoch';
import { BigNumber } from '../../lib/bignumber';

export const getLastEpochScoreAndPerformance = (
  previousEpochData: PreviousEpochQuery | undefined,
  id: string
) => {
  const validator = removePaginationWrapper(
    previousEpochData?.epoch?.validatorsConnection?.edges
  ).find((validator) => validator?.id === id);

  return {
    rawValidatorScore: validator?.rewardScore?.rawValidatorScore,
    performanceScore: validator?.rewardScore?.performanceScore,
    stakeScore: validator?.rankingScore?.stakeScore,
  };
};

export const getNormalisedVotingPower = (votingPower: string, decimals = 2) =>
  formatNumberPercentage(new BigNumber(votingPower).dividedBy(100), decimals);

export const getUnnormalisedVotingPower = (
  validatorScore: string | null | undefined
) =>
  validatorScore
    ? formatNumberPercentage(new BigNumber(validatorScore).times(100), 2)
    : null;

export const getFormattedPerformanceScore = (performanceScore?: string) =>
  performanceScore
    ? new BigNumber(performanceScore).dp(2)
    : new BigNumber(0).dp(2);

export const getPerformancePenalty = (performanceScore?: string) =>
  formatNumberPercentage(
    new BigNumber(1)
      .minus(getFormattedPerformanceScore(performanceScore))
      .times(100),
    2
  );

export const getOverstakingPenalty = (
  validatorScore: string | null | undefined,
  stakeScore: string | null | undefined
) => {
  if (!validatorScore || !stakeScore) {
    return '0%';
  }

  // avoid division by zero
  if (
    new BigNumber(validatorScore).isZero() ||
    new BigNumber(stakeScore).isZero()
  ) {
    return '0%';
  }

  return formatNumberPercentage(
    BigNumber.max(
      new BigNumber(1)
        .minus(
          new BigNumber(validatorScore).dividedBy(new BigNumber(stakeScore))
        )
        .times(100),
      new BigNumber(0)
    ),
    2
  );
};

export const getTotalPenalties = (
  rawValidatorScore: string | null | undefined,
  performanceScore: string | undefined,
  stakedOnNode: string,
  totalStake: string
) => {
  const calc =
    rawValidatorScore &&
    performanceScore &&
    new BigNumber(totalStake).isGreaterThan(0)
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

export const getStakePercentage = (total: BigNumber, stakedOnNode: BigNumber) =>
  total.isEqualTo(0) || stakedOnNode.isEqualTo(0)
    ? '0%'
    : stakedOnNode.dividedBy(total).times(100).dp(2).toString() + '%';
