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
      totalDiscount: '0',
    };
  }
  const referralDiscount = new BigNumber(referralDiscountFactor || '0')
    .multipliedBy(feeAmount)
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const volumeDiscount = new BigNumber(volumeDiscountFactor || '0')
    .multipliedBy((BigInt(feeAmount) - BigInt(referralDiscount)).toString())
    .toFixed(0, BigNumber.ROUND_FLOOR);
  const totalDiscount = (
    BigInt(referralDiscount) + BigInt(volumeDiscount)
  ).toString();
  const discountedFee = (
    BigInt(feeAmount || '0') - BigInt(totalDiscount)
  ).toString();
  return {
    totalDiscount,
    referralDiscount,
    volumeDiscount,
    discountedFee,
  };
};

export const getTotalDiscountFactor = (feeEstimate?: {
  volumeDiscountFactor?: string;
  referralDiscountFactor?: string;
}) => {
  if (
    !feeEstimate ||
    (feeEstimate.referralDiscountFactor === '0' &&
      feeEstimate.volumeDiscountFactor === '0')
  ) {
    return '0';
  }
  const volumeFactor = new BigNumber(
    feeEstimate?.volumeDiscountFactor || 0
  ).minus(1);
  const referralFactor = new BigNumber(
    feeEstimate?.referralDiscountFactor || 0
  ).minus(1);
  if (volumeFactor.isZero()) {
    return feeEstimate.referralDiscountFactor
      ? `-${feeEstimate.referralDiscountFactor}`
      : '0';
  }
  if (referralFactor.isZero()) {
    return feeEstimate.volumeDiscountFactor
      ? `-${feeEstimate.volumeDiscountFactor}`
      : '0';
  }
  return volumeFactor.multipliedBy(referralFactor).minus(1).toString();
};
