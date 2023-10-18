import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import { getVolumeTier } from './utils';
import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';

export const useVolumeStats = (
  stats?: FeesQuery['volumeDiscountStats'],
  program?: DiscountProgramsQuery['currentVolumeDiscountProgram']
) => {
  if (!stats || !program) {
    return {
      volumeDiscount: 0,
      volumeTierIndex: -1,
      volumeInWindow: 0,
      volumeTiers: [],
    };
  }

  const volumeStats = compact(stats.edges).map((e) => e.node);

  const volumeDiscount = Number(volumeStats[0].discountFactor || 0);

  const lastEpochStats = maxBy(volumeStats, (s) => s.atEpoch);
  const volumeInWindow = Number(lastEpochStats?.runningVolume || 0);

  const volumeTiers = [...program.benefitTiers].reverse();

  const volumeTierIndex = getVolumeTier(volumeInWindow, volumeTiers);

  return {
    volumeDiscount,
    volumeTierIndex,
    volumeInWindow,
    volumeTiers,
  };
};
