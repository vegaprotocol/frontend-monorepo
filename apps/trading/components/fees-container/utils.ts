/** Convert a number between 0-1 into a percentage value between 0-100 */
export const formatPercentage = (num: number) =>
  parseFloat((num * 100).toFixed(5));

export const getVolumeTier = (
  volume: number,
  tiers: Array<{
    minimumRunningNotionalTakerVolume: string;
  }>
) => {
  return tiers.findIndex((tier) => {
    return volume >= Number(tier.minimumRunningNotionalTakerVolume);
  });
};

export const getReferralBenefitTier = (
  epochsInSet: number,
  volume: number,
  tiers: Array<{
    minimumRunningNotionalTakerVolume: string;
    minimumEpochs: number;
  }>
) => {
  const indexByEpoch = tiers.findIndex((tier) => {
    return epochsInSet >= tier.minimumEpochs;
  });
  const indexByVolume = tiers.findIndex((tier) => {
    return volume >= Number(tier.minimumRunningNotionalTakerVolume);
  });

  if (indexByEpoch === -1 || indexByVolume === -1) {
    return -1;
  }

  return Math.max(indexByEpoch, indexByVolume);
};

export const getAdjustedFee = (fees: number[], discounts: number[]) => {
  const totalFee = fees.reduce((sum, f) => sum + f, 0);
  const totalDiscount = discounts.reduce((sum, d) => sum + d, 0);
  return totalFee * Math.max(0, 1 - totalDiscount);
};
