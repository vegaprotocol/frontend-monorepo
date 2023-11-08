import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import { getReferralBenefitTier } from './utils';
import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';
import { first } from 'lodash';

export const useReferralStats = (
  setStats?: FeesQuery['referralSetStats'],
  setReferees?: FeesQuery['referralSetReferees'],
  program?: DiscountProgramsQuery['currentReferralProgram'],
  epoch?: FeesQuery['epoch'],
  setIfReferrer?: FeesQuery['referrer'],
  setIfReferee?: FeesQuery['referee']
) => {
  const referralTiers = program?.benefitTiers || [];

  if (!setStats || !setReferees || !program || !epoch) {
    return {
      referralDiscount: 0,
      referralVolumeInWindow: 0,
      referralTierIndex: -1,
      referralTiers,
      epochsInSet: 0,
      code: undefined,
      isReferrer: false,
    };
  }

  const setIfReferrerData = first(
    compact(setIfReferrer?.edges).map((e) => e.node)
  );
  const setIfRefereeData = first(
    compact(setIfReferee?.edges).map((e) => e.node)
  );

  const referralSetsStats = compact(setStats.edges).map((e) => e.node);
  const referralSets = compact(setReferees.edges).map((e) => e.node);

  const referralSet = maxBy(referralSets, (s) => s.atEpoch);
  const referralStats = maxBy(referralSetsStats, (s) => s.atEpoch);

  const epochsInSet = referralSet ? Number(epoch.id) - referralSet.atEpoch : 0;

  const referralDiscount = Number(referralStats?.discountFactor || 0);
  const referralVolumeInWindow = Number(
    referralStats?.referralSetRunningNotionalTakerVolume || 0
  );

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
    code: (setIfReferrerData || setIfRefereeData)?.id,
    isReferrer: Boolean(setIfReferrerData),
  };
};
