import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useReferralSetStatsQuery } from './__generated__/ReferralSetStats';
import { findReferee, useReferees } from './use-referees';
import BigNumber from 'bignumber.js';
import { type BenefitTier, useReferralProgram } from './use-referral-program';
import { type StatValue } from '../constants';
import minBy from 'lodash/minBy';
import { useEpochInfoQuery } from '../../../lib/hooks/__generated__/Epoch';

export type RefereeStats = {
  /** the discount factor -> `discountFactor` ~ `referralDiscountFactor` */
  discountFactor: StatValue<BigNumber>;
  /** the benefit tier matching the referee's discount factor */
  benefitTier: StatValue<BenefitTier | undefined>;
  /** the next benefit tier after the current referee's tier */
  nextBenefitTier: StatValue<BenefitTier | undefined>;
  /** the running volume */
  runningVolume: StatValue<BigNumber>;
  /** the number of epochs in set */
  epochs: StatValue<BigNumber>;
};

const ZERO = BigNumber(0);

export const useRefereeStats = (
  pubKey: string,
  setId: string,
  aggregationEpochs: number
): RefereeStats => {
  const { data, loading, error } = useReferralSetStatsQuery({
    variables: {
      code: setId,
    },
    skip: !setId || setId.length === 0 || !pubKey || pubKey.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const {
    benefitTiers,
    loading: programLoading,
    error: programError,
  } = useReferralProgram();

  const {
    data: epochData,
    loading: epochsLoading,
    error: epochsError,
  } = useEpochInfoQuery({
    fetchPolicy: 'network-only',
  });

  const {
    data: refereesData,
    loading: refereesLoading,
    error: refereesError,
  } = useReferees(setId, aggregationEpochs);

  const referee = findReferee(pubKey, refereesData);
  const stats = removePaginationWrapper(data?.referralSetStats.edges).find(
    (s) => s.partyId === pubKey
  );

  const discountFactor = {
    value: stats?.discountFactor ? BigNumber(stats.discountFactor) : ZERO,
    loading: loading || refereesLoading,
    error: error || refereesError,
  };

  const benefitTier = {
    value: benefitTiers.find(
      (t) =>
        !discountFactor.value.isNaN() &&
        !isNaN(t.discountFactor) &&
        t.discountFactor === discountFactor.value.toNumber()
    ),
    loading: programLoading || discountFactor.loading,
    error: programError || discountFactor.error,
  };

  const nextTier = benefitTier.value?.tier
    ? benefitTier.value.tier + 1
    : undefined;
  const nextBenefitTier = {
    value: nextTier
      ? benefitTiers.find((t) => t.tier === nextTier)
      : minBy(benefitTiers, (t) => t.tier), //  min tier number is lowest tier
    loading: benefitTier.loading,
    error: benefitTier.error,
  };

  const runningVolume = {
    value: stats?.referralSetRunningNotionalTakerVolume
      ? BigNumber(stats.referralSetRunningNotionalTakerVolume)
      : ZERO,
    loading,
    error,
  };

  const joinedAtEpoch = BigNumber(referee?.atEpoch || '');
  const currentEpoch = BigNumber(epochData?.epoch.id || '');
  const epochs = {
    value:
      !currentEpoch.isNaN() && !joinedAtEpoch.isNaN()
        ? currentEpoch.minus(joinedAtEpoch)
        : ZERO,
    loading: refereesLoading || epochsLoading,
    error: refereesError || epochsError,
  };

  return {
    discountFactor,
    benefitTier,
    nextBenefitTier,
    runningVolume,
    epochs,
  };
};
