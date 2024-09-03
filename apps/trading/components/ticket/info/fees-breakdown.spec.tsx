import { render, screen } from '@testing-library/react';
import { FeesBreakdown } from './fees-breakdown';

describe('FeesBreakdown', () => {
  it('formats fee factors correctly', () => {
    const props = {
      decimals: 2,
      estimate: {
        fee: '1234',
        feeDiscounted: '1230',
        discount: '4',
        discountPct: '2',
        makerRebate: '100',
        makerRebatePct: '8',
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
