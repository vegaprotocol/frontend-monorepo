import type { LiquidityOrder } from '@vegaprotocol/types';
import { PeggedReference } from '@vegaprotocol/types';
import { sumProportions } from './liquidity-provision-details';

function mockProportion(proportion: number): LiquidityOrder {
  return {
    proportion,
    reference: PeggedReference.PEGGED_REFERENCE_MID,
    offset: '1',
  };
}
describe('Scale proportions - LP proportions do not always add up to 100%', () => {
  it('returns 0 if the side is undefined', () => {
    const side: LiquidityOrder[] = undefined as unknown as LiquidityOrder[];
    const res = sumProportions(side);

    expect(res).toEqual(0);
  });

  it('returns 0 if the side is empty', () => {
    const side: LiquidityOrder[] = [];
    const res = sumProportions(side);

    expect(res).toEqual(0);
  });

  it('Sums 1 item correctly (under 100%)', () => {
    const side: LiquidityOrder[] = [mockProportion(10)];
    const res = sumProportions(side);

    expect(res).toEqual(10);
  });

  it('Sums 2 item correctly (exactly 100%)', () => {
    const side: LiquidityOrder[] = [mockProportion(50), mockProportion(50)];
    const res = sumProportions(side);

    expect(res).toEqual(100);
  });

  it('Sums 3 item correctly to over 100%', () => {
    const side: LiquidityOrder[] = [
      mockProportion(20),
      mockProportion(40),
      mockProportion(50),
    ];
    const res = sumProportions(side);

    expect(res).toEqual(110);
  });
});
