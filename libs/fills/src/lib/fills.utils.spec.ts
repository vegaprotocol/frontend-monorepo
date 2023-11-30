import { getFeesBreakdown } from './fills.utils';

describe('getFeesBreakdown', () => {
  it('should return correct fees breakdown for a taker', () => {
    const fees = {
      makerFee: '1000',
      infrastructureFee: '2000',
      liquidityFee: '3000',
    };
    const expectedBreakdown = {
      infrastructureFee: '2000',
      liquidityFee: '3000',
      makerFee: '1000',
      totalFee: '6000',
      totalFeeDiscount: '0',
    };
    expect(getFeesBreakdown('Taker', fees)).toEqual(expectedBreakdown);
  });

  it('should return correct fees breakdown for a maker', () => {
    const fees = {
      makerFee: '1000',
      infrastructureFee: '2000',
      liquidityFee: '3000',
    };
    const expectedBreakdown = {
      infrastructureFee: '0',
      liquidityFee: '0',
      makerFee: '-1000',
      totalFee: '-1000',
      totalFeeDiscount: '0',
    };
    expect(getFeesBreakdown('Maker', fees)).toEqual(expectedBreakdown);
  });

  it('should return correct total fees discount value', () => {
    const fees = {
      infrastructureFeeReferralDiscount: '1',
      infrastructureFeeVolumeDiscount: '2',
      liquidityFeeReferralDiscount: '3',
      liquidityFeeVolumeDiscount: '4',
      makerFeeReferralDiscount: '5',
      makerFeeVolumeDiscount: '6',
      infrastructureFee: '1000',
      liquidityFee: '2000',
      makerFee: '3000',
    };
    const { totalFeeDiscount } = getFeesBreakdown('Taker', fees);
    expect(totalFeeDiscount).toEqual((1 + 2 + 3 + 4 + 5 + 6).toString());
  });
});
