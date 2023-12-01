import { getFeesBreakdown } from './fills.utils';
import * as Schema from '@vegaprotocol/types';

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

  it('should return correct fees breakdown for a maker if market is active', () => {
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
    expect(
      getFeesBreakdown('Maker', fees, Schema.MarketState.STATE_ACTIVE)
    ).toEqual(expectedBreakdown);
  });

  it('should return correct fees breakdown for a maker if the market is suspended', () => {
    const fees = {
      infrastructureFee: '2000',
      liquidityFee: '3000',
      makerFee: '0',
    };
    const expectedBreakdown = {
      infrastructureFee: '1000',
      liquidityFee: '1500',
      makerFee: '0',
      totalFee: '2500',
      totalFeeDiscount: '0',
    };
    expect(
      getFeesBreakdown('Maker', fees, Schema.MarketState.STATE_SUSPENDED)
    ).toEqual(expectedBreakdown);
  });

  it('should return correct fees breakdown for a taker if the market is suspended', () => {
    const fees = {
      infrastructureFee: '2000',
      liquidityFee: '3000',
      makerFee: '0',
    };
    const expectedBreakdown = {
      infrastructureFee: '1000',
      liquidityFee: '1500',
      makerFee: '0',
      totalFee: '2500',
      totalFeeDiscount: '0',
    };
    expect(
      getFeesBreakdown('Taker', fees, Schema.MarketState.STATE_SUSPENDED)
    ).toEqual(expectedBreakdown);
  });

  it('should return correct fees breakdown for a taker if market is active', () => {
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
    expect(
      getFeesBreakdown('Taker', fees, Schema.MarketState.STATE_ACTIVE)
    ).toEqual(expectedBreakdown);
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

  it('should return correct total fees discount value for a taker (if the market is active - default)', () => {
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

  it('should return correct total fees discount value for a maker (if the market is active - default)', () => {
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
    const { totalFeeDiscount } = getFeesBreakdown('Maker', fees);
    // makerFeeReferralDiscount and makerFeeVolumeDiscount are added, infra and liq. fees are zeroed
    expect(totalFeeDiscount).toEqual((5 + 6).toString());
  });

  it('should return correct total fees discount value for a maker (if the market is suspended)', () => {
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
    const { totalFeeDiscount } = getFeesBreakdown(
      'Maker',
      fees,
      Schema.MarketState.STATE_SUSPENDED
    );
    // makerFeeReferralDiscount and makerFeeVolumeDiscount are zeroed, infra and liq. fees are halved
    expect(totalFeeDiscount).toEqual(((1 + 2 + 3 + 4) / 2).toString());
  });

  it('should return correct total fees discount value for a taker (if the market is suspended)', () => {
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
    const { totalFeeDiscount } = getFeesBreakdown(
      'Taker',
      fees,
      Schema.MarketState.STATE_SUSPENDED
    );
    // makerFeeReferralDiscount and makerFeeVolumeDiscount are zeroed, infra and liq. fees are halved
    expect(totalFeeDiscount).toEqual(((1 + 2 + 3 + 4) / 2).toString());
  });
});
