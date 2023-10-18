import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import { getReferralBenefitTier } from './utils';
import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';

export const useReferralStats = (
  setStats?: FeesQuery['referralSetStats'],
  setReferees?: FeesQuery['referralSetReferees'],
  program?: DiscountProgramsQuery['currentReferralProgram'],
  epoch?: FeesQuery['epoch']
) => {
  if (!setStats || !setReferees || !program || !epoch) {
    return {
      referralDiscount: 0,
      referralVolumeInWindow: 0,
      referralTierIndex: -1,
      referralTiers: [],
      epochsInSet: 0,
    };
  }

  const referralSetsStats = compact(setStats.edges).map((e) => e.node);
  const referralSets = compact(setReferees.edges).map((e) => e.node);

  const referralSet = maxBy(referralSets, (s) => s.atEpoch);
  const referralStats = maxBy(referralSetsStats, (s) => s.atEpoch);

  const epochsInSet = referralSet ? Number(epoch.id) - referralSet.atEpoch : 0;

  const referralDiscount = Number(referralStats?.discountFactor || 0);
  const referralVolumeInWindow = Number(
    referralStats?.referralSetRunningNotionalTakerVolume || 0
  );

  const referralTiers = [...program.benefitTiers].reverse();

  const referralTierIndex = referralStats
    ? getReferralBenefitTier(
        epochsInSet,
        Number(referralStats.referralSetRunningNotionalTakerVolume),
        referralTiers
      )
    : -1;

  return {
    referralDiscount,
    referralVolumeInWindow,
    referralTierIndex,
    referralTiers,
    epochsInSet,
  };
};
