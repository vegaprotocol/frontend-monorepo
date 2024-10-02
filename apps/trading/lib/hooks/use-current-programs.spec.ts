import BigNumber from 'bignumber.js';
import type {
  ReferralProgramFieldsFragment,
  VolumeDiscountFieldsFragment,
} from './__generated__/CurrentPrograms';
import {
  type ReferralBenefitTier,
  type Fees,
  prepareReferralBenefitTiers,
  prepareReferralStakingTiers,
  type ReferralStakingTier,
  type VolumeDiscountBenefitTier,
  prepareVolumeDiscountBenefitTiers,
  type Factors,
  calcRewardFactor,
  calcDiscountFactor,
} from './use-current-programs';

const FEES: Fees = {
  buybackFee: 0.1,
  infrastructureFee: 0.2,
  liquidityFee: 0.3,
  makerFee: 0.4,
  treasuryFee: 0.5,
};
const REFERRAL_PROGRAM: ReferralProgramFieldsFragment = {
  id: 'program-a',
  version: 0,
  endOfProgramTimestamp: undefined,
  windowLength: 1,
  benefitTiers: [
    {
      minimumEpochs: 0,
      minimumRunningNotionalTakerVolume: '100',
      referralDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.01',
        makerFactor: '0.01',
        liquidityFactor: '0.01',
      },
      referralRewardFactors: {
        __typename: 'RewardFactors',
        infrastructureFactor: '0.01',
        makerFactor: '0.01',
        liquidityFactor: '0.01',
      },
    },
    {
      minimumEpochs: 0,
      minimumRunningNotionalTakerVolume: '200',
      referralDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.05',
        makerFactor: '0.05',
        liquidityFactor: '0.05',
      },
      referralRewardFactors: {
        __typename: 'RewardFactors',
        infrastructureFactor: '0.05',
        makerFactor: '0.05',
        liquidityFactor: '0.05',
      },
    },
    {
      minimumEpochs: 0,
      minimumRunningNotionalTakerVolume: '300',
      referralDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.1',
        makerFactor: '0.1',
        liquidityFactor: '0.1',
      },
      referralRewardFactors: {
        __typename: 'RewardFactors',
        infrastructureFactor: '0.1',
        makerFactor: '0.1',
        liquidityFactor: '0.1',
      },
    },
  ],
  stakingTiers: [
    {
      __typename: 'StakingTier',
      minimumStakedTokens: '100',
      referralRewardMultiplier: '1',
    },
    {
      __typename: 'StakingTier',
      minimumStakedTokens: '200',
      referralRewardMultiplier: '2',
    },
    {
      __typename: 'StakingTier',
      minimumStakedTokens: '300',
      referralRewardMultiplier: '3',
    },
  ],
};

const VOLUME_DISCOUNT_PROGRAM: VolumeDiscountFieldsFragment = {
  id: 'program-b',
  version: 0,
  endOfProgramTimestamp: undefined,
  windowLength: 1,
  benefitTiers: [
    {
      minimumRunningNotionalTakerVolume: '100',
      volumeDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.01',
        makerFactor: '0.01',
        liquidityFactor: '0.01',
      },
    },
    {
      minimumRunningNotionalTakerVolume: '200',
      volumeDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.05',
        makerFactor: '0.05',
        liquidityFactor: '0.05',
      },
    },
    {
      minimumRunningNotionalTakerVolume: '300',
      volumeDiscountFactors: {
        __typename: 'DiscountFactors',
        infrastructureFactor: '0.1',
        makerFactor: '0.1',
        liquidityFactor: '0.1',
      },
    },
  ],
};

describe('prepareReferralBenefitTiers', () => {
  it('prepares benefit tiers based on the current program and calculates the overall factors', () => {
    const expectedBenefitTiers: ReferralBenefitTier[] = [
      {
        discountFactor: BigNumber(0.006),
        discountFactors: {
          infrastructureFactor: 0.01,
          liquidityFactor: 0.01,
          makerFactor: 0.01,
        },
        epochs: 0,
        minimumRunningNotionalTakerVolume: 100,
        rewardFactor: BigNumber(0.006),
        rewardFactors: {
          infrastructureFactor: 0.01,
          liquidityFactor: 0.01,
          makerFactor: 0.01,
        },
        tier: 1,
      },
      {
        discountFactor: BigNumber(0.03),
        discountFactors: {
          infrastructureFactor: 0.05,
          liquidityFactor: 0.05,
          makerFactor: 0.05,
        },
        epochs: 0,
        minimumRunningNotionalTakerVolume: 200,
        rewardFactor: BigNumber(0.03),
        rewardFactors: {
          infrastructureFactor: 0.05,
          liquidityFactor: 0.05,
          makerFactor: 0.05,
        },
        tier: 2,
      },
      {
        discountFactor: BigNumber(0.06),
        discountFactors: {
          infrastructureFactor: 0.1,
          liquidityFactor: 0.1,
          makerFactor: 0.1,
        },
        epochs: 0,
        minimumRunningNotionalTakerVolume: 300,
        rewardFactor: BigNumber(0.06),
        rewardFactors: {
          infrastructureFactor: 0.1,
          liquidityFactor: 0.1,
          makerFactor: 0.1,
        },
        tier: 3,
      },
    ];

    expect(prepareReferralBenefitTiers(REFERRAL_PROGRAM, FEES)).toEqual(
      expectedBenefitTiers
    );
  });
});

describe('prepareReferralStakingTiers', () => {
  it('prepares staking tiers based on the current program', () => {
    const expectedStakingTiers: ReferralStakingTier[] = [
      {
        minimumStakedTokens: '100',
        referralRewardMultiplier: '1',
        tier: 1,
      },
      {
        minimumStakedTokens: '200',
        referralRewardMultiplier: '2',
        tier: 2,
      },
      {
        minimumStakedTokens: '300',
        referralRewardMultiplier: '3',
        tier: 3,
      },
    ];
    expect(prepareReferralStakingTiers(REFERRAL_PROGRAM)).toEqual(
      expectedStakingTiers
    );
  });
});

describe('prepareVolumeDiscountBenefitTiers', () => {
  it('prepared volume discount benefit tiers based on the current program and calculates the overall factors', () => {
    const expectedBenefitTiers: VolumeDiscountBenefitTier[] = [
      {
        discountFactor: BigNumber(0.006),
        discountFactors: {
          infrastructureFactor: 0.01,
          liquidityFactor: 0.01,
          makerFactor: 0.01,
        },
        minimumRunningNotionalTakerVolume: 100,
        tier: 1,
      },
      {
        discountFactor: BigNumber(0.03),
        discountFactors: {
          infrastructureFactor: 0.05,
          liquidityFactor: 0.05,
          makerFactor: 0.05,
        },
        minimumRunningNotionalTakerVolume: 200,
        tier: 2,
      },
      {
        discountFactor: BigNumber(0.06),
        discountFactors: {
          infrastructureFactor: 0.1,
          liquidityFactor: 0.1,
          makerFactor: 0.1,
        },
        minimumRunningNotionalTakerVolume: 300,
        tier: 3,
      },
    ];
    expect(
      prepareVolumeDiscountBenefitTiers(VOLUME_DISCOUNT_PROGRAM, FEES)
    ).toEqual(expectedBenefitTiers);
  });
});

const FACTORS_A: Factors = {
  infrastructureFactor: 0,
  makerFactor: 0,
  liquidityFactor: 0,
};

const FACTORS_B: Factors = {
  infrastructureFactor: 0.1,
  makerFactor: 0.1,
  liquidityFactor: 0.1,
};

const FACTORS_C: Factors = {
  infrastructureFactor: 0.5,
  makerFactor: 0.5,
  liquidityFactor: 0.5,
};

const FACTORS_D: Factors = {
  infrastructureFactor: 1,
  makerFactor: 1,
  liquidityFactor: 1,
};

describe('calcRewardFactor', () => {
  it.each([
    [FEES, FACTORS_A, BigNumber(0)],
    [FEES, FACTORS_B, BigNumber(0.06)],
    [FEES, FACTORS_C, BigNumber(0.3)],
    [FEES, FACTORS_D, BigNumber(0.6)],
  ])('calculated the reward factor', (fees, factors, expectedFactor) => {
    expect(calcRewardFactor(fees, factors)).toEqual(expectedFactor);
  });
});

describe('calcDiscountFactor', () => {
  it.each([
    [FEES, FACTORS_A, BigNumber(0)],
    [FEES, FACTORS_B, BigNumber(0.06)],
    [FEES, FACTORS_C, BigNumber(0.3)],
    [FEES, FACTORS_D, BigNumber(0.6)],
  ])('calculated the reward factor', (fees, factors, expectedFactor) => {
    expect(calcDiscountFactor(fees, factors)).toEqual(expectedFactor);
  });
});
