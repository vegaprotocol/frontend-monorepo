import { renderHook } from '@testing-library/react';
import { useReferralStats } from './use-referral-stats';

describe('useReferralStats', () => {
  const setStats = {
    edges: [
      {
        __typename: 'ReferralSetStatsEdge' as const,
        node: {
          __typename: 'ReferralSetStats' as const,
          atEpoch: 9,
          discountFactor: '0.2',
          referralSetRunningNotionalTakerVolume: '100',
        },
      },
      {
        __typename: 'ReferralSetStatsEdge' as const,
        node: {
          __typename: 'ReferralSetStats' as const,
          atEpoch: 10,
          discountFactor: '0.3',
          referralSetRunningNotionalTakerVolume: '200',
        },
      },
    ],
  };

  const sets = {
    edges: [
      {
        node: {
          atEpoch: 3,
        },
      },
      {
        node: {
          atEpoch: 4,
        },
      },
    ],
  };

  const epoch = {
    id: '10',
  };

  const program = {
    windowLength: 5,
    benefitTiers: [
      {
        minimumEpochs: 4,
        minimumRunningNotionalTakerVolume: '100',
        referralDiscountFactor: '0.01',
      },
      {
        minimumEpochs: 6,
        minimumRunningNotionalTakerVolume: '200',
        referralDiscountFactor: '0.05',
      },
      {
        minimumEpochs: 8,
        minimumRunningNotionalTakerVolume: '300',
        referralDiscountFactor: '0.1',
      },
    ],
  };

  it('returns correct default values', () => {
    const { result } = renderHook(() => useReferralStats());
    expect(result.current).toEqual({
      referralDiscount: 0,
      referralVolumeInWindow: 0,
      referralTierIndex: -1,
      referralTiers: [],
      epochsInSet: 0,
    });
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() =>
      useReferralStats(setStats, sets, program, epoch)
    );

    // should use stats from latest epoch
    const stats = setStats.edges[1].node;
    const set = sets.edges[1].node;

    expect(result.current).toEqual({
      referralDiscount: Number(stats.discountFactor),
      referralVolumeInWindow: Number(
        stats.referralSetRunningNotionalTakerVolume
      ),
      referralTierIndex: 1,
      referralTiers: program.benefitTiers,
      epochsInSet: Number(epoch.id) - set.atEpoch,
    });
  });

  it.each([
    { joinedAt: 2, index: -1 },
    { joinedAt: 3, index: -1 },
    { joinedAt: 4, index: 0 },
    { joinedAt: 5, index: 0 },
    { joinedAt: 6, index: 1 },
    { joinedAt: 7, index: 1 },
    { joinedAt: 8, index: 2 },
    { joinedAt: 9, index: 2 },
  ])('joined at epoch: $joinedAt should be index: $index', (obj) => {
    const statsA = {
      edges: [
        {
          __typename: 'ReferralSetStatsEdge' as const,
          node: {
            __typename: 'ReferralSetStats' as const,
            atEpoch: 10,
            discountFactor: '0.3',
            referralSetRunningNotionalTakerVolume: '100000',
          },
        },
      ],
    };
    const setsA = {
      edges: [
        {
          node: {
            atEpoch: Number(epoch.id) - obj.joinedAt,
          },
        },
      ],
    };
    const { result } = renderHook(() =>
      useReferralStats(statsA, setsA, program, epoch)
    );

    expect(result.current.referralTierIndex).toEqual(obj.index);
  });

  it.each([
    { volume: '50', index: -1 },
    { volume: '100', index: 0 },
    { volume: '150', index: 0 },
    { volume: '200', index: 1 },
    { volume: '250', index: 1 },
    { volume: '300', index: 2 },
    { volume: '999', index: 2 },
  ])('volume: $volume should be index: $index', (obj) => {
    const statsA = {
      edges: [
        {
          __typename: 'ReferralSetStatsEdge' as const,
          node: {
            __typename: 'ReferralSetStats' as const,
            atEpoch: 10,
            discountFactor: '0.3',
            referralSetRunningNotionalTakerVolume: obj.volume,
          },
        },
      ],
    };
    const setsA = {
      edges: [
        {
          node: {
            atEpoch: 1,
          },
        },
      ],
    };
    const { result } = renderHook(() =>
      useReferralStats(statsA, setsA, program, epoch)
    );

    expect(result.current.referralTierIndex).toEqual(obj.index);
  });
});
