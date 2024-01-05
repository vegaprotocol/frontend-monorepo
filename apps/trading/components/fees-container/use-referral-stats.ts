import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';

export const useReferralStats = (
  previousEpoch?: number,
  referralStats?: NonNullable<
    FeesQuery['referralSetStats']['edges']['0']
  >['node'],
  setReferees?: NonNullable<
    FeesQuery['referralSetReferees']['edges']['0']
  >['node'],
  program?: DiscountProgramsQuery['currentReferralProgram'],
  setIfReferrer?: NonNullable<FeesQuery['referrer']['edges']['0']>['node'],
  setIfReferee?: NonNullable<FeesQuery['referee']['edges']['0']>['node']
) => {
  const referralTiers = program?.benefitTiers || [];

  if (
    !previousEpoch ||
    referralStats?.atEpoch !== previousEpoch ||
    !program ||
    !setReferees
  ) {
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

  const referralDiscount = Number(referralStats?.discountFactor || 0);
  const referralVolumeInWindow = Number(
    referralStats?.referralSetRunningNotionalTakerVolume || 0
  );

  const referralTierIndex = referralTiers.findIndex(
    (tier) => tier.referralDiscountFactor === referralStats?.discountFactor
  );

  return {
    referralDiscount,
    referralVolumeInWindow,
    referralTierIndex,
    referralTiers,
    epochsInSet: referralStats.atEpoch - setReferees.atEpoch,
    code: (setIfReferrer || setIfReferee)?.id,
    isReferrer: Boolean(setIfReferrer),
  };
};
