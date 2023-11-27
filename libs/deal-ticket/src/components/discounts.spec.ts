import { getDiscountedFee, getTotalDiscountFactor } from './discounts';

describe('getDiscountedFee', () => {
  it('calculates values if volumeDiscount or referralDiscount is undefined', () => {
    expect(getDiscountedFee('100')).toEqual({
      discountedFee: '100',
      volumeDiscount: '0',
      referralDiscount: '0',
      totalDiscount: '0',
    });
    expect(getDiscountedFee('100', undefined, '0.1')).toEqual({
      discountedFee: '90',
      volumeDiscount: '10',
      referralDiscount: '0',
      totalDiscount: '10',
    });
    expect(getDiscountedFee('100', '0.1', undefined)).toEqual({
      discountedFee: '90',
      volumeDiscount: '0',
      referralDiscount: '10',
      totalDiscount: '10',
    });
  });

  it('calculates values using volumeDiscount or referralDiscount', () => {
    expect(getDiscountedFee('', '0.1', '0.2')).toEqual({
      discountedFee: '',
      volumeDiscount: '0',
      referralDiscount: '0',
      totalDiscount: '0',
    });
  });
});

describe('getTotalDiscountFactor', () => {
  it('returns 0 if discounts are 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0',
        referralDiscountFactor: '0',
      })
    ).toEqual('0');
  });

  it('returns volumeDiscountFactor if referralDiscountFactor is 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0.1',
        referralDiscountFactor: '0',
      })
    ).toEqual('-0.1');
  });
  it('returns referralDiscountFactor if volumeDiscountFactor is 0', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0',
        referralDiscountFactor: '0.1',
      })
    ).toEqual('-0.1');
  });

  it('calculates discount using referralDiscountFactor and volumeDiscountFactor', () => {
    expect(
      getTotalDiscountFactor({
        volumeDiscountFactor: '0.2',
        referralDiscountFactor: '0.1',
      })
    ).toBe('-0.28');
  });
});
