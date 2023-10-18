import compact from 'lodash/compact';
import { getReferralBenefitTier } from './utils';
import type { FeesQuery } from './__generated__/Fees';

export const useReferralStats = (
  setStats?: FeesQuery['referralSetStats'],
  setReferees?: FeesQuery['referralSetReferees'],
  program?: FeesQuery['currentReferralProgram'],
  epoch?: FeesQuery['epoch']
) => {
  if (!setStats || !setReferees || !program || !epoch) {
    return {
      referralDiscount: 0,
      referralVolume: 0,
      referralTierIndex: -1,
      referralTiers: [],
      epochsInSet: 0,
    };
  }

  const referralSetsStats = compact(setStats.edges).map((e) => e.node);
  const referralSets = compact(setReferees.edges).map((e) => e.node);

  if (referralSets.length > 1 || referralSetsStats.length > 1) {
    throw new Error('more than one referral set for user');
  }

  const referralSet = referralSets[0];
  const referralStats = referralSetsStats[0];

  const epochsInSet = Number(epoch.id) - referralSet.atEpoch;
  const referralDiscount = Number(referralStats.discountFactor || 0);

  const referralTiers = [...program.benefitTiers].reverse();

  const referralTierIndex = getReferralBenefitTier(
    epochsInSet,
    Number(referralStats.referralSetRunningNotionalTakerVolume),
    referralTiers
  );

  const referralVolume = Number(
    referralStats.referralSetRunningNotionalTakerVolume
  );

  return {
    referralDiscount,
    referralVolume,
    referralTierIndex,
    referralTiers,
    epochsInSet,
  };
};
