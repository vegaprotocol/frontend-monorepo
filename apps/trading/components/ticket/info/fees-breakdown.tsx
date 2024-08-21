import BigNumber from 'bignumber.js';
import { sumFeesFactors } from '@vegaprotocol/markets';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';

import { getDiscountedFee, getTotalDiscountFactor } from '../utils';
import { useT } from '../../../lib/use-t';
import { type useEstimateFees } from './fees';

const formatValue = (
  value: string | number | null | undefined,
  decimals: number
): string =>
  value && !isNaN(Number(value))
    ? addDecimalsFormatNumber(value, decimals)
    : '-';

const FeesBreakdownItem = ({
  label,
  factor,
  value,
  symbol,
  decimals,
  testId,
}: {
  label: string;
  factor?: string | number;
  value: string;
  symbol?: string;
  decimals: number;
  testId?: string;
}) => (
  <>
    <dt className="col-span-2" data-testid={`${testId}-label`}>
      {label}
    </dt>
    <dd className="text-right col-span-1" data-testid={`${testId}-factor`}>
      {factor ? formatNumberPercentage(new BigNumber(factor).times(100)) : ''}
    </dd>
    <dd className="text-right col-span-3" data-testid={`${testId}-value`}>
      {formatValue(value, decimals)} {symbol || ''}
    </dd>
  </>
);

export const FeesBreakdown = ({
  feeEstimate,
  feeFactors,
  symbol,
  decimals,
}: {
  feeEstimate: ReturnType<typeof useEstimateFees>;
  feeFactors?: {
    makerFee: string;
    infrastructureFee: string;
    liquidityFee: string;
  };
  symbol?: string;
  decimals: number;
}) => {
  const t = useT();
  const { fees, totalFeeAmount, referralDiscountFactor, volumeDiscountFactor } =
    feeEstimate || {};
  if (!fees || !totalFeeAmount || totalFeeAmount === '0') return null;

  const totalDiscountFactor = getTotalDiscountFactor(feeEstimate);
  const { discountedFee: discountedTotalFeeAmount, totalDiscount } =
    getDiscountedFee(
      totalFeeAmount,
      referralDiscountFactor,
      volumeDiscountFactor
    );

  return (
    <dl className="grid grid-cols-6">
      <FeesBreakdownItem
        label={t('Infrastructure fee')}
        factor={feeFactors?.infrastructureFee}
        value={fees.infrastructureFee}
        symbol={symbol}
        decimals={decimals}
        testId="infrastructure-fee"
      />

      <FeesBreakdownItem
        label={t('Liquidity fee')}
        factor={feeFactors?.liquidityFee}
        value={fees.liquidityFee}
        symbol={symbol}
        decimals={decimals}
        testId="liquidity-fee"
      />

      <FeesBreakdownItem
        label={t('Maker fee')}
        factor={feeFactors?.makerFee}
        value={fees.makerFee}
        symbol={symbol}
        decimals={decimals}
        testId="maker-fee"
      />
      {totalDiscount && totalDiscount !== '0' ? (
        <>
          <FeesBreakdownItem
            label={t('Subtotal')}
            value={totalFeeAmount}
            factor={
              feeFactors ? sumFeesFactors(feeFactors)?.toString() : undefined
            }
            symbol={symbol}
            decimals={decimals}
            testId="subtotal-fee"
          />
          <div className="col-span-6 mt-2"></div>
          <FeesBreakdownItem
            label={t('Discount')}
            factor={totalDiscountFactor}
            value={`-${totalDiscount}`}
            symbol={symbol}
            decimals={decimals}
            testId="discount-fee"
          />
          <FeesBreakdownItem
            label={t('Total')}
            value={discountedTotalFeeAmount}
            symbol={symbol}
            decimals={decimals}
            testId="total-fee"
          />
        </>
      ) : (
        <>
          <div className="col-span-6 mt-2"></div>
          <FeesBreakdownItem
            label={t('Total')}
            factor={
              feeFactors ? sumFeesFactors(feeFactors)?.toString() : undefined
            }
            value={totalFeeAmount}
            symbol={symbol}
            decimals={decimals}
            testId="full-total-fee"
          />
        </>
      )}
    </dl>
  );
};
