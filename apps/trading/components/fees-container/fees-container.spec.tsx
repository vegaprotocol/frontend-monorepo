import { render, screen } from '@testing-library/react';
import { formatNumber } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
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

    const makerBigNum = new BigNumber(makerFee);
    const infraBigNum = new BigNumber(infraFee);
    const minLiqBigNum = new BigNumber(minLiqFee);
    const maxLiqBigNum = new BigNumber(maxLiqFee);
    const referralBigNum = new BigNumber(referralDiscount);
    const volumeBigNum = new BigNumber(volumeDiscount);

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

    const minFee = formatPercentage(
      makerBigNum.plus(infraFee).plus(minLiqFee).toNumber()
    );
    const maxFee = formatPercentage(
      makerBigNum.plus(infraFee).plus(maxLiqFee).toNumber()
    );

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
        [makerBigNum, infraBigNum, minLiqBigNum],
        [referralBigNum, volumeBigNum]
      )
    );

    const maxAdjustedFees = formatPercentage(
      getAdjustedFee(
        [makerBigNum, infraBigNum, maxLiqBigNum],
        [referralBigNum, volumeBigNum]
      )
    );

    expect(screen.getByTestId('adjusted-fees')).toHaveTextContent(
      `${minAdjustedFees}%-${maxAdjustedFees}%`
    );
  });
});

describe('CurerntVolume', () => {
  it('renders the required amount for the next tier', () => {
    const windowLengthVolume = 1500;
    const nextTierVolume = 2000;

    const props = {
      tiers: [
        { minimumRunningNotionalTakerVolume: '1000' },
        { minimumRunningNotionalTakerVolume: nextTierVolume.toString() },
        { minimumRunningNotionalTakerVolume: '3000' },
      ],
      tierIndex: 0,
      windowLengthVolume,
      windowLength: 5,
    };

    render(<CurrentVolume {...props} />);

    expect(
      screen.getByText(formatNumber(windowLengthVolume)).nextElementSibling
    ).toHaveTextContent(`Past ${props.windowLength} epochs`);

    expect(
      screen.getByText(formatNumber(nextTierVolume - windowLengthVolume))
        .nextElementSibling
    ).toHaveTextContent('Required for next tier');
  });
});
