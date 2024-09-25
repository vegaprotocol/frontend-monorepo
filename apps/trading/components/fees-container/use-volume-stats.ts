import {
  areFactorsEqual,
  type Factors,
  parseFactors,
  type VolumeDiscountBenefitTier,
} from '../../lib/hooks/use-current-programs';
import type { FeesQuery } from './__generated__/Fees';

export type VolumeStats = {
  /** The current discount factors applied */
  discountFactors: Factors | undefined;
  /** The benefit tier matching the current factors applied */
  benefitTier: VolumeDiscountBenefitTier | undefined;
  /** The current running volume (in program's window) */
  volume: number;
};

export type VolumeDiscountStat = NonNullable<
  FeesQuery['volumeDiscountStats']['edges']['0']
>['node'];

export const EMPTY: VolumeStats = {
  discountFactors: undefined,
  benefitTier: undefined,
  volume: 0,
};

export const useVolumeStats = (
  previousEpoch: number,
  lastEpochStats?: VolumeDiscountStat,
  benefitTiers?: VolumeDiscountBenefitTier[]
): VolumeStats => {
  if (
    !lastEpochStats ||
    lastEpochStats.atEpoch !== previousEpoch ||
    !benefitTiers
  ) {
    return EMPTY;
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
