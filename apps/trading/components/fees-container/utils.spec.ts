import BigNumber from 'bignumber.js';
import { getAdjustedFee } from './utils';

describe('getAdjustedFee', () => {
  it('simple', () => {
    const volumeDiscount = 0.5;
    const referralDiscount = 0.5;

    const infraFee = 0.1;
    const makerFee = 0.1;
    const liqFee = 0.1;

    const fees = [
      new BigNumber(infraFee),
      new BigNumber(makerFee),
      new BigNumber(liqFee),
    ];

    const discounts = [
      new BigNumber(volumeDiscount),
      new BigNumber(referralDiscount),
    ];

    // 1 - 0.5 = 0.5
    const v = new BigNumber(1).minus(new BigNumber(volumeDiscount));

    // 1 - 0.5 = 0.5
    const r = new BigNumber(1).minus(new BigNumber(referralDiscount));

    // 0.5 * 0.5 = 0.25
    // 1 - 0.25 = 0.75
    const factor = new BigNumber(1).minus(v.times(r));

    // 0.1 + 0.1 + 0.1 = 0.3
    const totalFees = fees.reduce((sum, x) => sum.plus(x), new BigNumber(0));

    // (1 - 0.3) * 0.75 = 0.525
    const expected = new BigNumber(totalFees)
      .times(new BigNumber(1).minus(factor))
      .toNumber();

    expect(getAdjustedFee(fees, discounts)).toBe(expected);
  });

  it('combines discount factors multiplicatively', () => {
    const volumeDiscount = 0.4;
    const referralDiscount = 0.1;

    const infraFee = 0.0005;
    const makerFee = 0.0002;
    const liqFee = 0.01;

    const fees = [
      new BigNumber(infraFee),
      new BigNumber(makerFee),
      new BigNumber(liqFee),
    ];

    const discounts = [
      new BigNumber(volumeDiscount),
      new BigNumber(referralDiscount),
    ];

    // formula for calculating adjusted fees
    const v = new BigNumber(1).minus(new BigNumber(volumeDiscount));
    const r = new BigNumber(1).minus(new BigNumber(referralDiscount));
    const factor = new BigNumber(1).minus(v.times(r));

    // summed fees
    const totalFees = fees.reduce((sum, x) => sum.plus(x), new BigNumber(0));

    const expected = new BigNumber(totalFees)
      .times(new BigNumber(1).minus(factor))
      .toNumber();

    expect(getAdjustedFee(fees, discounts)).toBe(expected);
  });
});
