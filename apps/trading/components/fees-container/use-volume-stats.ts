import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import { getVolumeTier } from './utils';
import type { FeesQuery } from './__generated__/Fees';

export const useVolumeStats = (
  stats?: FeesQuery['volumeDiscountStats'],
  program?: FeesQuery['currentVolumeDiscountProgram']
) => {
  if (!stats || !program) {
    return {
      volumeDiscount: 0,
      volumeTierIndex: -1,
      volumeLastEpoch: 0,
      volumeTiers: [],
    };
  }

  const volumeStats = compact(stats.edges).map((e) => e.node);

  const volumeDiscount = Number(volumeStats[0].discountFactor || 0);

  const lastEpochVolumeStats = stats
    ? maxBy(volumeStats, (s) => s.atEpoch)
    : undefined;

  const volumeLastEpoch = Number(lastEpochVolumeStats?.runningVolume || 0);

  const volumeTiers = [...program.benefitTiers].reverse();

  const volumeTierIndex = getVolumeTier(volumeLastEpoch, volumeTiers);

  return {
    volumeDiscount,
    volumeTierIndex,
    volumeLastEpoch,
    volumeTiers,
  };
};
