import { getUserLocale } from '@vegaprotocol/utils';

/**
 * Convert a number between 0-1 into a percentage value between 0-100
 *
 * Not using formatNumberPercentage from vegaprotocol/utils as this
 * returns a string and includes extra 0s on the end. We need these
 * values in aggrid as numbers for sorting
 */
export const formatPercentage = (num: number) => {
  const pct = num * 100;
  const parts = pct.toString().split('.');
  const dps = parts[1] ? parts[1].length : 0;
  const formatter = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: dps,
    maximumFractionDigits: dps,
  });
  return formatter.format(parseFloat(pct.toFixed(5)));
};

/**
 * Return the index of the benefit tier for volume discounts. A user
 * only needs to fulfill a minimum volume requirement for the tier
 */
export const getVolumeTier = (
  volume: number,
  tiers: Array<{
    minimumRunningNotionalTakerVolume: string;
  }>
) => {
  return tiers.findIndex((tier, i) => {
    const nextTier = tiers[i + 1];
    const validVolume =
      volume >= Number(tier.minimumRunningNotionalTakerVolume);

    if (nextTier) {
      return (
        validVolume &&
        volume < Number(nextTier.minimumRunningNotionalTakerVolume)
      );
    }

    return validVolume;
  });
};

/**
 * Return the index of the benefit tiers for referrals. A user must
 * fulfill both the minimum epochs in the referral set, and the set
 * must reach the combined total volume
 */
export const getReferralBenefitTier = (
  epochsInSet: number,
  volume: number,
  tiers: Array<{
    minimumRunningNotionalTakerVolume: string;
    minimumEpochs: number;
  }>
) => {
  const indexByEpoch = tiers.findIndex((tier, i) => {
    const nextTier = tiers[i + 1];
    const validEpochs = epochsInSet >= tier.minimumEpochs;

    if (nextTier) {
      return validEpochs && epochsInSet < nextTier.minimumEpochs;
    }

    return validEpochs;
  });
  const indexByVolume = tiers.findIndex((tier, i) => {
    const nextTier = tiers[i + 1];
    const validVolume =
      volume >= Number(tier.minimumRunningNotionalTakerVolume);

    if (nextTier) {
      return (
        validVolume &&
        volume < Number(nextTier.minimumRunningNotionalTakerVolume)
      );
    }

    return validVolume;
  });

  return Math.min(indexByEpoch, indexByVolume);
};

/**
 * Given a set of fees and a set of discounts return
 * the adjusted fee factor
 */
export const getAdjustedFee = (fees: number[], discounts: number[]) => {
  const totalFee = fees.reduce((sum, f) => sum + f, 0);
  const totalDiscount = discounts.reduce((sum, d) => sum + d, 0);
  return totalFee * Math.max(0, 1 - totalDiscount);
};
