import { render, screen } from '@testing-library/react';
import { FeesBreakdown } from './fees-breakdown';
import BigNumber from 'bignumber.js';

describe('FeesBreakdown', () => {
  it('formats fee factors correctly', () => {
    const props = {
      decimals: 2,
      estimate: {
        fee: BigNumber(1234),
        feeDiscounted: BigNumber(1230),
        discount: BigNumber(4),
        discountPct: BigNumber(2),
        makerRebate: BigNumber(100),
        makerRebatePct: BigNumber(8),
      },
    };
    render(<FeesBreakdown {...props} />);
    expect(screen.getByText('Fee').nextElementSibling).toHaveTextContent(
      '12.34'
    );
    expect(screen.getByText('Discount').nextElementSibling).toHaveTextContent(
      '0.04 (2%)'
    );
    expect(
      screen.getByText('Discounted fee').nextElementSibling
    ).toHaveTextContent('12.30');
    expect(
      screen.getByText('Maker rebate').nextElementSibling
    ).toHaveTextContent('1.00 (8%)');
  });
});
