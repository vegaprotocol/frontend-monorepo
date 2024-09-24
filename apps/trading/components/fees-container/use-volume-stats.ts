import {
  areFactorsEqual,
  type Factors,
  parseFactors,
  type VolumeDiscountBenefitTier,
} from '../../lib/hooks/use-current-programs';
import type { FeesQuery } from './__generated__/Fees';

type VolumeStats = {
  /** The current discount factors applied */
  discountFactors: Factors | undefined;
  /** The benefit tier matching the current factors applied */
  benefitTier: VolumeDiscountBenefitTier | undefined;
  /** The current running volume (in program's window) */
  volume: number;
};

export const useVolumeStats = (
  previousEpoch: number,
  lastEpochStats?: NonNullable<
    FeesQuery['volumeDiscountStats']['edges']['0']
  >['node'],
  benefitTiers?: VolumeDiscountBenefitTier[]
): VolumeStats => {
  if (
    !lastEpochStats ||
    lastEpochStats.atEpoch !== previousEpoch ||
    !benefitTiers
  ) {
    return {
      discountFactors: undefined,
      benefitTier: undefined,
      volume: 0,
    };
  }

  const discountFactors = parseFactors(lastEpochStats.discountFactors);
  const volume = Number(lastEpochStats.runningVolume);

  const benefitTier = benefitTiers.find((tier) =>
    areFactorsEqual(tier.discountFactors, discountFactors)
  );

  return {
    discountFactors,
    benefitTier,
    volume,
  };
};
