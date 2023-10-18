import compact from 'lodash/compact';
import maxBy from 'lodash/maxBy';
import { getVolumeTier } from './utils';
import type { DiscountProgramsQuery, FeesQuery } from './__generated__/Fees';

export const useVolumeStats = (
  stats?: FeesQuery['volumeDiscountStats'],
  program?: DiscountProgramsQuery['currentVolumeDiscountProgram']
) => {
  const volumeTiers = program?.benefitTiers || [];

  if (!stats || !program) {
    return {
      volumeDiscount: 0,
      volumeTierIndex: -1,
      volumeInWindow: 0,
      volumeTiers,
    };
  }

  const volumeStats = compact(stats.edges).map((e) => e.node);
  const lastEpochStats = maxBy(volumeStats, (s) => s.atEpoch);
  const volumeDiscount = Number(lastEpochStats?.discountFactor || 0);
  const volumeInWindow = Number(lastEpochStats?.runningVolume || 0);
  const volumeTierIndex = getVolumeTier(volumeInWindow, volumeTiers);

  return {
    volumeDiscount,
    volumeTierIndex,
    volumeInWindow,
    volumeTiers,
  };
};
