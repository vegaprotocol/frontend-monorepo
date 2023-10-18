import { renderHook } from '@testing-library/react';
import { useReferralStats } from './use-referral-stats';

describe('useReferralStats', () => {
  const setStats = {
    edges: [
      {
        __typename: 'ReferralSetStatsEdge' as const,
        node: {
          __typename: 'ReferralSetStats' as const,
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
          atEpoch: 5,
        },
      },
    ],
  };

  const epoch = {
    id: '10',
  };

  const program = {
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
      referralVolume: 0,
      referralTierIndex: -1,
      referralTiers: [],
      epochsInSet: 0,
    });
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() =>
      useReferralStats(setStats, sets, program, epoch)
    );

    const stats = setStats.edges[0].node;

    expect(result.current).toEqual({
      referralDiscount: Number(stats.discountFactor),
      referralVolume: Number(stats.referralSetRunningNotionalTakerVolume),
      referralTierIndex: 2,
      referralTiers: [...program.benefitTiers].reverse(),
      epochsInSet: Number(epoch.id) - sets.edges[0].node.atEpoch,
    });
  });

  it.each([
    { epoch: 8, index: -1 },
    { epoch: 7, index: -1 },
    { epoch: 6, index: 2 },
    { epoch: 5, index: 2 },
    { epoch: 4, index: 1 },
    { epoch: 3, index: 1 },
    { epoch: 2, index: 0 },
    { epoch: 1, index: 0 },
  ])('limits tier by number of epochs $epoch', (obj) => {
    const statsA = {
      edges: [
        {
          __typename: 'ReferralSetStatsEdge' as const,
          node: {
            __typename: 'ReferralSetStats' as const,
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
            atEpoch: obj.epoch,
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
    { volume: '100', index: 2 },
    { volume: '150', index: 2 },
    { volume: '200', index: 1 },
    { volume: '250', index: 1 },
    { volume: '300', index: 0 },
    { volume: '999', index: 0 },
  ])('limits tier by number required volume $volume', (obj) => {
    const statsA = {
      edges: [
        {
          __typename: 'ReferralSetStatsEdge' as const,
          node: {
            __typename: 'ReferralSetStats' as const,
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
