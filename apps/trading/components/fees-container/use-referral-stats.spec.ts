import { renderHook } from '@testing-library/react';
import {
  EMPTY,
  type ReferralSetStat,
  type ReferralStats,
  useReferralStats,
} from './use-referral-stats';
import type {
  ProgramsData,
  ReferralBenefitTier,
} from '../../lib/hooks/use-current-programs';
import BigNumber from 'bignumber.js';

describe('useReferralStats', () => {
  const TIER_1: ReferralBenefitTier = {
    tier: 1,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.01,
      liquidityFactor: 0.01,
      makerFactor: 0.01,
    },
    epochs: 4,
    minimumRunningNotionalTakerVolume: 100,
    rewardFactor: BigNumber(0),
    rewardFactors: {
      infrastructureFactor: 0.01,
      liquidityFactor: 0.01,
      makerFactor: 0.01,
    },
  };

  const TIER_2: ReferralBenefitTier = {
    tier: 2,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.05,
      liquidityFactor: 0.05,
      makerFactor: 0.05,
    },
    epochs: 6,
    minimumRunningNotionalTakerVolume: 200,
    rewardFactor: BigNumber(0),
    rewardFactors: {
      infrastructureFactor: 0.05,
      liquidityFactor: 0.05,
      makerFactor: 0.05,
    },
  };

  const TIER_3: ReferralBenefitTier = {
    tier: 3,
    discountFactor: BigNumber(0),
    discountFactors: {
      infrastructureFactor: 0.1,
      liquidityFactor: 0.1,
      makerFactor: 0.1,
    },
    epochs: 8,
    minimumRunningNotionalTakerVolume: 300,
    rewardFactor: BigNumber(0),
    rewardFactors: {
      infrastructureFactor: 0.1,
      liquidityFactor: 0.1,
      makerFactor: 0.1,
    },
  };

  const program: ProgramsData['referralProgram'] = {
    details: {
      windowLength: 5,
      id: 'RP1',
      version: 0,
      endOfProgramTimestamp: undefined,
    },
    benefitTiers: [TIER_1, TIER_2, TIER_3],
    stakingTiers: [],
  };

  const stat: ReferralSetStat = {
    __typename: 'ReferralSetStats' as const,
    atEpoch: 9,
    referralSetRunningNotionalTakerVolume: '100',
    discountFactors: {
      __typename: 'DiscountFactors',
      infrastructureFactor: '0.01',
      liquidityFactor: '0.01',
      makerFactor: '0.01',
    },
  };

  const set = {
    atEpoch: 4,
  };

  it('returns correct default values', () => {
    const { result } = renderHook(() => useReferralStats());
    expect(result.current).toEqual(EMPTY);
  });

  it('returns default values if set is not from previous epoch', () => {
    const { result } = renderHook(() =>
      useReferralStats(10, stat, set, program)
    );
    expect(result.current).toEqual(EMPTY);
  });

  it('returns stats based on the given values', () => {
    const { result } = renderHook(() =>
      useReferralStats(9, stat, set, program)
    );

    const expectedStats: ReferralStats = {
      discountFactors: {
        infrastructureFactor: 0.01,
        liquidityFactor: 0.01,
        makerFactor: 0.01,
      },
      volume: 100,
      benefitTier: TIER_1,
      epochsInSet: 5,
      code: undefined,
      isReferrer: false,
    };

    expect(result.current).toEqual(expectedStats);
  });
});
