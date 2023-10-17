/** Convert a number between 0-1 into a percentage value between 0-100 */
export const format = (num: number) => parseFloat((num * 100).toFixed(5));

export const getVolumeTier = (
  volume: number,
  tiers: Array<{
    minimumRunningNotionalTakerVolume: string;
    volumeDiscountFactor: string;
  }>
) => {
  for (let i = 0; i < tiers.length; i++) {
    const currTier = tiers[i];
    const nextTier = tiers[i + 1];
    const currRequiredVol = Number(currTier.minimumRunningNotionalTakerVolume);
    const nextRequiredVol = Number(nextTier.minimumRunningNotionalTakerVolume);

    // User has less than volume than required for lowest tier
    if (i === 0 && volume < currRequiredVol) {
      return -1;
    }

    // User has more volume than required for the highest tier
    if (i === tiers.length - 1 && volume > currRequiredVol) {
      return i;
    }

    if (volume > currRequiredVol && volume < nextRequiredVol) {
      return i;
    }
  }

  return -1;
};
