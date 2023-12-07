import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';

export const useVolumeStats = (
  previousEpoch: number,
  lastEpochStats?: NonNullable<
    FeesQuery['volumeDiscountStats']['edges']['0']
  >['node'],
  program?: DiscountProgramsQuery['currentVolumeDiscountProgram']
) => {
  const volumeTiers = program?.benefitTiers || [];

  if (!lastEpochStats || lastEpochStats.atEpoch !== previousEpoch || !program) {
    return {
      volumeDiscount: 0,
      volumeTierIndex: -1,
      volumeInWindow: 0,
      volumeTiers,
    };
  }

  const volumeDiscount = Number(lastEpochStats?.discountFactor || 0);
  const volumeInWindow = Number(lastEpochStats?.runningVolume || 0);
  const volumeTierIndex = volumeTiers.findIndex(
    (tier) => tier.volumeDiscountFactor === lastEpochStats?.discountFactor
  );

  return {
    volumeDiscount,
    volumeTierIndex,
    volumeInWindow,
    volumeTiers,
  };
};
