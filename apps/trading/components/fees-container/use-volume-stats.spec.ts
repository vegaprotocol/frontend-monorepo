import { renderHook } from '@testing-library/react';
import { useVolumeStats } from './use-volume-stats';

describe('useReferralStats', () => {
  const statsList = {
    edges: [
      {
        __typename: 'VolumeDiscountStatsEdge' as const,
        node: {
          __typename: 'VolumeDiscountStats' as const,
          atEpoch: 9,
          discountFactor: '0.1',
          runningVolume: '100',
        },
      },
      {
        __typename: 'VolumeDiscountStatsEdge' as const,
        node: {
          __typename: 'VolumeDiscountStats' as const,
          atEpoch: 10,
          discountFactor: '0.3',
          runningVolume: '200',
        },
      },
    ],
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
    const { result } = renderHook(() => useVolumeStats());
    expect(result.current).toEqual({
      volumeDiscount: 0,
      volumeInWindow: 0,
      volumeTierIndex: -1,
      volumeTiers: [],
    });
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() => useVolumeStats(statsList, program));

    // should use stats from latest epoch
    const stats = statsList.edges[1].node;

    expect(result.current).toEqual({
      volumeDiscount: Number(stats.discountFactor),
      volumeInWindow: Number(stats.runningVolume),
      volumeTierIndex: 1,
      volumeTiers: [...program.benefitTiers].reverse(),
    });
  });

  it.each([
    { volume: '100', index: 2 },
    { volume: '150', index: 2 },
    { volume: '200', index: 1 },
    { volume: '250', index: 1 },
    { volume: '300', index: 0 },
    { volume: '350', index: 0 },
  ])('returns index: $index for the running volume: $volume', (obj) => {
    const statsA = {
      edges: [
        {
          __typename: 'VolumeDiscountStatsEdge' as const,
          node: {
            __typename: 'VolumeDiscountStats' as const,
            atEpoch: 10,
            discountFactor: '0.3',
            runningVolume: obj.volume,
          },
        },
      ],
    };

    const { result } = renderHook(() => useVolumeStats(statsA, program));
    expect(result.current.volumeTierIndex).toBe(obj.index);
  });
});
