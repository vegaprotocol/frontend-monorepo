import { renderHook } from '@testing-library/react';
import {
  EMPTY,
  useVolumeStats,
  type VolumeDiscountStat,
  type VolumeStats,
} from './use-volume-stats';
import type {
  ProgramsData,
  VolumeDiscountBenefitTier,
} from '../../lib/hooks/use-current-programs';
import BigNumber from 'bignumber.js';

describe('useReferralStats', () => {
  const TIER_1: VolumeDiscountBenefitTier = {
    tier: 1,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.01,
      liquidityFactor: 0.01,
      makerFactor: 0.01,
    },
    minimumRunningNotionalTakerVolume: 100,
  };

  const TIER_2: VolumeDiscountBenefitTier = {
    tier: 2,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.05,
      liquidityFactor: 0.05,
      makerFactor: 0.05,
    },
    minimumRunningNotionalTakerVolume: 200,
  };

  const TIER_3: VolumeDiscountBenefitTier = {
    tier: 3,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.1,
      liquidityFactor: 0.1,
      makerFactor: 0.1,
    },
    minimumRunningNotionalTakerVolume: 300,
  };

  const stats: VolumeDiscountStat = {
    __typename: 'VolumeDiscountStats' as const,
    atEpoch: 10,
    discountFactors: {
      infrastructureFactor: '0.05',
      liquidityFactor: '0.05',
      makerFactor: '0.05',
    },
    runningVolume: '200',
  };

  const program: ProgramsData['volumeDiscountProgram'] = {
    details: {
      windowLength: 5,
      id: 'VP1',
      version: 0,
      endOfProgramTimestamp: undefined,
    },
    benefitTiers: [TIER_1, TIER_2, TIER_3],
  };

  it('returns correct default values', () => {
    const { result } = renderHook(() => useVolumeStats(10));

    expect(result.current).toEqual(EMPTY);
  });

  it('returns default values if no stat is not from previous epoch', () => {
    const { result } = renderHook(() =>
      useVolumeStats(11, stats, program.benefitTiers)
    );
    expect(result.current).toEqual(EMPTY);
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() =>
      useVolumeStats(10, stats, program.benefitTiers)
    );

    const expectedStats: VolumeStats = {
      discountFactors: {
        infrastructureFactor: 0.05,
        liquidityFactor: 0.05,
        makerFactor: 0.05,
      },
      benefitTier: TIER_2,
      volume: 200,
    };

    expect(result.current).toEqual(expectedStats);
  });
});
