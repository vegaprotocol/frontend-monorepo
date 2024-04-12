import { useReferralSetStatsQuery } from './__generated__/ReferralSetStats';
import BigNumber from 'bignumber.js';
import { useReferees } from './use-referees';
import { DEFAULT_AGGREGATION_DAYS, type StatValue } from '../constants';

export type ReferrerStats = {
  /** the base commission -> `rewardFactor` ~ `referralRewardFactor` */
  baseCommission: StatValue<BigNumber>;
  /** the staking multiplier -> `rewardsMultiplier` ~ `referralRewardMultiplier` */
  multiplier: StatValue<BigNumber>;
  /** the final commission -> base * multiplier */
  finalCommission: StatValue<BigNumber>;
  /** the referrer taker volume -> `referrerTakerVolume` */
  volume: StatValue<BigNumber>;
  /** the number of referees -> referees query required */
  referees: StatValue<BigNumber>;
  /** the total commission -> sum of `totalRefereeGeneratedRewards` */
  totalCommission: StatValue<BigNumber>;
  runningVolume: StatValue<BigNumber>;
};

const ZERO = BigNumber(0);
const ONE = BigNumber(1);

export const useReferrerStats = (
  setId: string,
  aggregationEpochs: number
): ReferrerStats => {
  const { data, loading, error } = useReferralSetStatsQuery({
    variables: {
      code: setId,
    },
    skip: !setId || setId.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: refereesData,
    loading: refereesLoading,
    error: refereesError,
  } = useReferees(setId, aggregationEpochs, {
    properties: [
      'totalRefereeGeneratedRewards',
      'totalRefereeNotionalTakerVolume',
    ],
    // get _30_ days for total commission
    aggregationEpochs: DEFAULT_AGGREGATION_DAYS,
  });

  const statsAvailable = data?.referralSetStats.edges[0]?.node;

  const baseCommission = {
    value: statsAvailable ? BigNumber(statsAvailable.rewardFactor) : ZERO,
    loading,
    error,
  };

  const multiplier = {
    value: statsAvailable ? BigNumber(statsAvailable.rewardsMultiplier) : ONE,
    loading,
    error,
  };

  const finalCommission = {
    value: multiplier.value.isNaN()
      ? baseCommission.value
      : new BigNumber(multiplier.value).times(baseCommission.value),
    loading,
    error,
  };

  const volume = {
    value: statsAvailable
      ? BigNumber(statsAvailable.referrerTakerVolume)
      : ZERO,
    loading,
    error,
  };

  const referees = {
    value: BigNumber(refereesData.length),
    loading: refereesLoading,
    error: refereesError,
  };

  const totalCommission = {
    value: refereesData
      .map((r) => new BigNumber(r.totalRefereeGeneratedRewards))
      .reduce((all, r) => all.plus(r), ZERO),
    loading: refereesLoading,
    error: refereesError,
  };

  const runningVolume = {
    value: statsAvailable?.referralSetRunningNotionalTakerVolume
      ? BigNumber(statsAvailable.referralSetRunningNotionalTakerVolume)
      : ZERO,
    loading,
    error,
  };

  return {
    baseCommission,
    multiplier,
    finalCommission,
    volume,
    referees,
    totalCommission,
    runningVolume,
  };
};
