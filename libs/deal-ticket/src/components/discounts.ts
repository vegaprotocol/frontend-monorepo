import BigNumber from 'bignumber.js';

export const getDiscountedFee = (
  feeAmount: string,
  referralDiscountFactor?: string,
  volumeDiscountFactor?: string
) => {
  if (
    ((!referralDiscountFactor || referralDiscountFactor === '0') &&
      (!volumeDiscountFactor || volumeDiscountFactor === '0')) ||
    !feeAmount ||
    feeAmount === '0'
  ) {
    return {
      discountedFee: feeAmount,
      volumeDiscount: '0',
      referralDiscount: '0',
    };
  }
  const referralDiscount = new BigNumber(referralDiscountFactor || '0')
    .multipliedBy(feeAmount)
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const volumeDiscount = new BigNumber(volumeDiscountFactor || '0')
    .multipliedBy((BigInt(feeAmount) - BigInt(referralDiscount)).toString())
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const discountedFee = (
    BigInt(feeAmount || '0') -
    BigInt(referralDiscount) -
    BigInt(volumeDiscount)
  ).toString();
  return {
    referralDiscount,
    volumeDiscount,
    discountedFee,
  };
};

export const getTotalDiscountFactor = (feeEstimate?: {
  volumeDiscountFactor?: string;
  referralDiscountFactor?: string;
}) => {
  if (!feeEstimate) {
    return 0;
  }
  const volumeFactor = Number(feeEstimate?.volumeDiscountFactor) || 0;
  const referralFactor = Number(feeEstimate?.referralDiscountFactor) || 0;
  if (!volumeFactor) {
    return referralFactor;
  }
  if (!referralFactor) {
    return volumeFactor;
  }
  return 1 - (1 - volumeFactor) * (1 - referralFactor);
};
