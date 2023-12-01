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
