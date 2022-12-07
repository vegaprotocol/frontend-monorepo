import { removePaginationWrapper, toBigNum } from '@vegaprotocol/react-helpers';
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

export const getNormalisedVotingPower = (votingPower: string) => {
  return toBigNum(votingPower, 0).dividedBy(100).dp(2).toString() + '%';
};

export const getUnnormalisedVotingPower = (
  validatorScore: string | null | undefined
) =>
  validatorScore
    ? new BigNumber(validatorScore).times(100).dp(2).toString() + '%'
    : null;

export const getFormattedPerformanceScore = (performanceScore: string) =>
  new BigNumber(performanceScore).dp(2);

export const getPerformancePenalty = (performanceScore: string) =>
  new BigNumber(1)
    .minus(getFormattedPerformanceScore(performanceScore))
    .times(100)
    .toString() + '%';

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
  overstakedAmount
    .dividedBy(new BigNumber(stakedOnNode))
    .times(100)
    .dp(2)
    .toString() + '%';

export const getTotalPenalties = (
  rawValidatorScore: string | null | undefined,
  performanceScore: string,
  stakedOnNode: string,
  totalStake: string
) => {
  const totalPenaltiesCalc =
    rawValidatorScore !== null
      ? 100 *
        Math.max(
          0,
          1 -
            (Number(performanceScore) * Number(rawValidatorScore)) /
              (Number(stakedOnNode) / Number(totalStake || 0))
        )
      : 0;

  return toBigNum(totalPenaltiesCalc, 0).dp(2).toString() + '%';
};
