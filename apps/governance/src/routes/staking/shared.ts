import {
  formatNumberPercentage,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import type { PreviousEpochQuery } from './__generated__/PreviousEpoch';
import { BigNumber } from '../../lib/bignumber';
import type { LastArrayElement } from 'type-fest';

type Node = NonNullable<
  LastArrayElement<
    NonNullable<
      NonNullable<PreviousEpochQuery['epoch']['validatorsConnection']>['edges']
    >
  >
>['node'];

/**
 * Calculates theoretical stake score for a given node
 * @param nodeId Id of a node for which a score is calculated
 * @param nodes A collection of all nodes
 * @returns Theoretical stake score for given node based on the staked total
 * of all node of the same type (status)
 */
const calculateTheoreticalStakeScore = (nodeId: string, nodes: Node[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    return new BigNumber(0);
  }
  const all = nodes
    .filter((n) => n.rankingScore.status === node.rankingScore.status)
    .map((n) => new BigNumber(n.stakedTotal));
  const sumOfSameType = all.reduce((acc, a) => acc.plus(a), new BigNumber(0));
  if (sumOfSameType.isZero()) {
    return new BigNumber(0);
  }
  return new BigNumber(node.stakedTotal).dividedBy(sumOfSameType);
};

/**
 * Calculates overall penalty for a given node
 * @param nodeId Id of a node for which a penalty is calculated
 * @param nodes A collection of all nodes - needed to calculate theoretical stake score
 * @returns %
 */
export const calculateOverallPenalty = (nodeId: string, nodes: Node[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  const tts = calculateTheoreticalStakeScore(nodeId, nodes);
  if (!node || tts.isZero()) {
    return new BigNumber(0);
  }
  const penalty = new BigNumber(1)
    .minus(new BigNumber(node.rewardScore?.validatorScore || 0).dividedBy(tts))
    .times(100);
  return penalty.isLessThan(0) ? new BigNumber(0) : penalty;
};

/**
 *  Calculates over-staked penalty for a given node
 * @param nodeId Id of a node for which a penalty is calculated
 * @param nodes A collection of all nodes - needed to calculate theoretical stake score
 * @returns %
 */
export const calculateOverstakedPenalty = (nodeId: string, nodes: Node[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  const tts = calculateTheoreticalStakeScore(nodeId, nodes);
  if (!node || tts.isZero()) {
    return new BigNumber(0);
  }
  const penalty = new BigNumber(1)
    .minus(
      new BigNumber(node.rewardScore?.rawValidatorScore || 0).dividedBy(tts)
    )
    .times(100);
  return penalty.isLessThan(0) ? new BigNumber(0) : penalty;
};

/**
 * Calculates performance penalty based on the given performance score.
 * @returns %
 */
export const calculatesPerformancePenalty = (performanceScore: string) => {
  const penalty = new BigNumber(1)
    .minus(new BigNumber(performanceScore))
    .times(100);
  return penalty.isLessThan(0) ? new BigNumber(0) : penalty;
};

export const getLastEpochScoreAndPerformance = (
  previousEpochData: PreviousEpochQuery | undefined,
  id: string
) => {
  const validator = removePaginationWrapper(
    previousEpochData?.epoch?.validatorsConnection?.edges
  ).find((validator) => validator?.id === id);

  return {
    rawValidatorScore: validator?.rewardScore?.rawValidatorScore,
    performanceScore: validator?.rankingScore?.performanceScore,
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
