import { render, screen } from '@testing-library/react';
import { FeesBreakdown } from './fees-breakdown';

describe('FeesBreakdown', () => {
  it('formats fee factors correctly', () => {
    const feeFactors = {
      makerFee: '0.00005',
      infrastructureFee: '0.001',
      liquidityFee: '0.5',
    };
    const fees = {
      makerFee: '100',
      infrastructureFee: '100',
      liquidityFee: '100',
    };
    const props = {
      feeFactors,
      symbol: 'USD',
      decimals: 2,

      feeEstimate: {
        referralDiscountFactor: '0.01',
        volumeDiscountFactor: '0.01',
        totalFeeAmount: '100',
        fees,
      },
    };
    render(<FeesBreakdown {...props} />);
    expect(screen.getByText('Maker fee').nextElementSibling).toHaveTextContent(
      '0.005%'
    );
    expect(
      screen.getByText('Infrastructure fee').nextElementSibling
    ).toHaveTextContent('0.1%');
    expect(
      screen.getByText('Liquidity fee').nextElementSibling
    ).toHaveTextContent('50%');
  });
});
