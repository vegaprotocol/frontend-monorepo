import { renderHook } from '@testing-library/react';
import { useReferralStats } from './use-referral-stats';

describe('useReferralStats', () => {
  const stat = {
    __typename: 'ReferralSetStats' as const,
    atEpoch: 9,
    discountFactor: '0.01',
    referralSetRunningNotionalTakerVolume: '100',
  };

  const set = {
    atEpoch: 4,
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
      code: undefined,
      isReferrer: false,
    });
  });

  it('returns default values if set is not from previous epoch', () => {
    const { result } = renderHook(() =>
      useReferralStats(10, stat, set, program)
    );
    expect(result.current).toEqual({
      referralDiscount: 0,
      referralVolumeInWindow: 0,
      referralTierIndex: -1,
      referralTiers: program.benefitTiers,
      epochsInSet: 0,
      code: undefined,
      isReferrer: false,
    });
  });

  it('returns formatted data and tiers', () => {
    const { result } = renderHook(() =>
      useReferralStats(9, stat, set, program)
    );

    expect(result.current).toEqual({
      referralDiscount: Number(stat.discountFactor),
      referralVolumeInWindow: Number(
        stat.referralSetRunningNotionalTakerVolume
      ),
      referralTierIndex: 0,
      referralTiers: program.benefitTiers,
      epochsInSet: stat.atEpoch - set.atEpoch,
      code: undefined,
      isReferrer: false,
    });
  });
});
