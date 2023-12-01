import { renderHook } from '@testing-library/react';
import { useVolumeStats } from './use-volume-stats';

describe('useReferralStats', () => {
  const stats = {
    __typename: 'VolumeDiscountStats' as const,
    atEpoch: 10,
    discountFactor: '0.05',
    runningVolume: '200',
  };

  const program = {
    windowLength: 5,
    benefitTiers: [
      {
        minimumRunningNotionalTakerVolume: '100',
        volumeDiscountFactor: '0.01',
      },
      {
        minimumRunningNotionalTakerVolume: '200',
        volumeDiscountFactor: '0.05',
      },
      {
        minimumRunningNotionalTakerVolume: '300',
        volumeDiscountFactor: '0.1',
      },
    ],
  };

  it('returns correct default values', () => {
    const { result } = renderHook(() => useVolumeStats(10));
    expect(result.current).toEqual({
      volumeDiscount: 0,
      volumeInWindow: 0,
      volumeTierIndex: -1,
      volumeTiers: [],
    });
  });

  it('returns default values if no stat is not from previous epoch', () => {
    const { result } = renderHook(() => useVolumeStats(11, stats, program));
    expect(result.current).toEqual({
      volumeDiscount: 0,
      volumeInWindow: 0,
      volumeTierIndex: -1,
      volumeTiers: program.benefitTiers,
    });
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() => useVolumeStats(10, stats, program));

    expect(result.current).toEqual({
      volumeDiscount: Number(stats.discountFactor),
      volumeInWindow: Number(stats.runningVolume),
      volumeTierIndex: 1,
      volumeTiers: program.benefitTiers,
    });
  });
});
