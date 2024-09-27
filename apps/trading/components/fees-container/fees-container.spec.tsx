import { render, screen } from '@testing-library/react';
import { formatNumber } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { CurrentVolume, TradingFees } from './fees-container';
import { formatPercentage, getAdjustedFee } from './utils';
import type { Factors } from '../../lib/hooks/use-current-programs';

describe('TradingFees', () => {
  it('renders correct fee data', () => {
    const makerFee = 0.01;
    const infraFee = 0.01;
    const minLiqFee = 0.1;
    const maxLiqFee = 0.3;

    const makerBigNum = new BigNumber(makerFee);
    const infraBigNum = new BigNumber(infraFee);
    const minLiqBigNum = new BigNumber(minLiqFee);
    const maxLiqBigNum = new BigNumber(maxLiqFee);

    const params = {
      market_fee_factors_makerFee: makerFee.toString(),
      market_fee_factors_infrastructureFee: infraFee.toString(),
    };

    const markets = [
      { fees: { factors: { liquidityFee: minLiqFee.toString() } } },
      { fees: { factors: { liquidityFee: '0.2' } } },
      { fees: { factors: { liquidityFee: maxLiqFee.toString() } } },
    ];

    const referralDiscountFactors: Factors = {
      infrastructureFactor: 0.01,
      makerFactor: 0.01,
      liquidityFactor: 0.01,
    };

    const volumeDiscountFactors: Factors = {
      infrastructureFactor: 0.01,
      makerFactor: 0.01,
      liquidityFactor: 0.01,
    };

    render(
      <TradingFees
        params={params}
        markets={markets}
        referralDiscountFactors={referralDiscountFactors}
        volumeDiscountFactors={volumeDiscountFactors}
      />
    );

    const minFee = formatPercentage(
      makerBigNum.plus(infraFee).plus(minLiqFee).toNumber()
    );
    const maxFee = formatPercentage(
      makerBigNum.plus(infraFee).plus(maxLiqFee).toNumber()
    );

    expect(
      screen.getByText('Taker fee before discount').nextElementSibling
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
        [
          ...Object.values(referralDiscountFactors).map((f) => BigNumber(f)),
          ...Object.values(volumeDiscountFactors).map((f) => BigNumber(f)),
        ]
      )
    );

    const maxAdjustedFees = formatPercentage(
      getAdjustedFee(
        [makerBigNum, infraBigNum, maxLiqBigNum],
        [
          ...Object.values(referralDiscountFactors).map((f) => BigNumber(f)),
          ...Object.values(volumeDiscountFactors).map((f) => BigNumber(f)),
        ]
      )
    );

    expect(screen.getByTestId('adjusted-fees')).toHaveTextContent(
      `${minAdjustedFees}%-${maxAdjustedFees}%`
    );
  });
});

describe('CurrentVolume', () => {
  it('renders the required amount for the next tier', () => {
    const windowLengthVolume = 1500;
    const windowLength = 5;

    const TIER_1 = {
      tier: 1,
      discountFactors: {
        infrastructureFactor: 0,
        makerFactor: 0,
        liquidityFactor: 0,
      },
      discountFactor: new BigNumber(0),
      minimumRunningNotionalTakerVolume: 1000,
    };

    const TIER_2 = {
      tier: 2,
      discountFactors: {
        infrastructureFactor: 0,
        makerFactor: 0,
        liquidityFactor: 0,
      },
      discountFactor: new BigNumber(0),
      minimumRunningNotionalTakerVolume: 2000,
    };

    const TIER_3 = {
      tier: 3,
      discountFactors: {
        infrastructureFactor: 0,
        makerFactor: 0,
        liquidityFactor: 0,
      },
      discountFactor: new BigNumber(0),
      minimumRunningNotionalTakerVolume: 3000,
    };

    render(
      <CurrentVolume
        tiers={[TIER_1, TIER_2, TIER_3]}
        currentTier={TIER_1}
        windowLengthVolume={windowLengthVolume}
        windowLength={windowLength}
      />
    );

    expect(
      screen.getByText(formatNumber(windowLengthVolume)).nextElementSibling
    ).toHaveTextContent(`Past ${windowLength} epochs`);

    expect(
      screen.getByText(
        formatNumber(
          TIER_2.minimumRunningNotionalTakerVolume - windowLengthVolume
        )
      ).nextElementSibling
    ).toHaveTextContent('Required for next tier');
  });
});
