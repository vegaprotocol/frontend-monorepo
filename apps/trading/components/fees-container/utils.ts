import { getUserLocale } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

/**
 * Convert a number between 0-1 into a percentage value between 0-100
 *
 * Not using formatNumberPercentage from vegaprotocol/utils as this
 * returns a string and includes extra 0s on the end. We need these
 * values in aggrid as numbers for sorting
 */
export const formatPercentage = (num: number) => {
  const pct = new BigNumber(num).times(100);
  const dps = pct.decimalPlaces();
  const formatter = new Intl.NumberFormat(getUserLocale(), {
    // set to 0 in order to remove the "trailing zeroes" for numbers such as:
    // 0.123456789 -non-zero-min-> 12.3456800% -zero-min-> 12.34568%
    minimumFractionDigits: 0,
    maximumFractionDigits: dps || 0,
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
 *
 * Formula for calculating the adjusted fees
 *  total_discount_factor = 1 - (1 - volumeDiscount) * (1 - referralDiscount)
 */
export const getAdjustedFee = (fees: BigNumber[], discounts: BigNumber[]) => {
  const totalFee = fees.reduce((sum, f) => sum.plus(f), new BigNumber(0));

  const combinedFactors = discounts.reduce((acc, d) => {
    return acc.times(new BigNumber(1).minus(d));
  }, new BigNumber(1));

  const totalFactor = new BigNumber(1).minus(combinedFactors);

  return totalFee
    .times(new BigNumber(1).minus(BigNumber.max(0, totalFactor)))
    .toNumber();
};
