import { render, screen } from '@testing-library/react';
import { CurrentVolume, TradingFees } from './fees-container';
import { formatPercentage, getAdjustedFee } from './utils';

describe('TradingFees', () => {
  it('renders correct fee data', () => {
    const makerFee = 0.01;
    const infraFee = 0.01;
    const minLiqFee = 0.1;
    const maxLiqFee = 0.3;

    const referralDiscount = 0.01;
    const volumeDiscount = 0.01;

    const props = {
      params: {
        market_fee_factors_makerFee: makerFee.toString(),
        market_fee_factors_infrastructureFee: infraFee.toString(),
      },
      markets: [
        { fees: { factors: { liquidityFee: minLiqFee.toString() } } },
        { fees: { factors: { liquidityFee: '0.2' } } },
        { fees: { factors: { liquidityFee: maxLiqFee.toString() } } },
      ],
      referralDiscount,
      volumeDiscount,
    };
    render(<TradingFees {...props} />);

    const minFee = formatPercentage(makerFee + infraFee + minLiqFee);
    const maxFee = formatPercentage(makerFee + infraFee + maxLiqFee);
    expect(
      screen.getByText('Total fee before discount').nextElementSibling
    ).toHaveTextContent(`${minFee}%-${maxFee}%`);
    expect(
      screen.getByText('Infrastructure').nextElementSibling
    ).toHaveTextContent(formatPercentage(infraFee) + '%');
    expect(screen.getByText('Maker').nextElementSibling).toHaveTextContent(
      formatPercentage(makerFee) + '%'
    );

    const minAdjustedFees = formatPercentage(
      getAdjustedFee(
        [makerFee, infraFee, minLiqFee],
        [referralDiscount, volumeDiscount]
      )
    );

    const maxAdjustedFees = formatPercentage(
      getAdjustedFee(
        [makerFee, infraFee, maxLiqFee],
        [referralDiscount, volumeDiscount]
      )
    );

    expect(screen.getByTestId('adjusted-fees')).toHaveTextContent(
      `${minAdjustedFees}%-${maxAdjustedFees}%`
    );
  });
});

describe('CurerntVolume', () => {
  it('renders the reuqire amount for the next tier', () => {
    const props = {
      tiers: [
        { minimumRunningNotionalTakerVolume: '3000' },
        { minimumRunningNotionalTakerVolume: '2000' },
        { minimumRunningNotionalTakerVolume: '1000' },
      ],
      tierIndex: 2,
      windowLengthVolume: 1500,
      epochs: 5,
    };

    render(<CurrentVolume {...props} />);

    expect(screen.getByText('1,500').nextElementSibling).toHaveTextContent(
      `Past ${props.epochs} epochs`
    );

    expect(screen.getByText('500').nextElementSibling).toHaveTextContent(
      'Required for next tier'
    );
  });
});
