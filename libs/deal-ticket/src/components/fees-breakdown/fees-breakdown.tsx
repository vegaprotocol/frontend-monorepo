import { sumFeesFactors } from '@vegaprotocol/markets';
import type { TradeFee, FeeFactors } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { getDiscountedFee } from '../discounts';
import { useT } from '../../use-t';

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
}: {
  label: string;
  factor?: string;
  value: string;
  symbol?: string;
  decimals: number;
}) => (
  <>
    <dt className="col-span-2">{label}</dt>
    {factor && (
      <dd className="text-right col-span-1">
        {formatNumberPercentage(new BigNumber(factor).times(100))}
      </dd>
    )}
    <dd className="text-right col-span-3">
      {formatValue(value, decimals)} {symbol || ''}
    </dd>
  </>
);

export const FeesBreakdown = ({
  totalFeeAmount,
  fees,
  feeFactors,
  symbol,
  decimals,
  referralDiscountFactor,
  volumeDiscountFactor,
}: {
  totalFeeAmount?: string;
  fees?: TradeFee;
  feeFactors?: FeeFactors;
  symbol?: string;
  decimals: number;
  referralDiscountFactor?: string;
  volumeDiscountFactor?: string;
}) => {
  const t = useT();
  if (!fees || !totalFeeAmount || totalFeeAmount === '0') return null;

  const { discountedFee: discountedInfrastructureFee } = getDiscountedFee(
    fees.infrastructureFee,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  const { discountedFee: discountedLiquidityFee } = getDiscountedFee(
    fees.liquidityFee,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  const { discountedFee: discountedMakerFee } = getDiscountedFee(
    fees.makerFee,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  const {
    discountedFee: discountedTotalFeeAmount,
    volumeDiscount,
    referralDiscount,
  } = getDiscountedFee(
    totalFeeAmount,
    referralDiscountFactor,
    volumeDiscountFactor
  );

  return (
    <dl className="grid grid-cols-6">
      <FeesBreakdownItem
        label={t('Infrastructure fee')}
        factor={feeFactors?.infrastructureFee}
        value={discountedInfrastructureFee}
        symbol={symbol}
        decimals={decimals}
      />

      <FeesBreakdownItem
        label={t('Liquidity fee')}
        factor={feeFactors?.liquidityFee}
        value={discountedLiquidityFee}
        symbol={symbol}
        decimals={decimals}
      />

      <FeesBreakdownItem
        label={t('Maker fee')}
        factor={feeFactors?.makerFee}
        value={discountedMakerFee}
        symbol={symbol}
        decimals={decimals}
      />
      {volumeDiscountFactor && volumeDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Volume discount')}
          factor={volumeDiscountFactor}
          value={volumeDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
      {referralDiscountFactor && referralDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Referral discount')}
          factor={referralDiscountFactor}
          value={referralDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
      <FeesBreakdownItem
        label={t('Total fees')}
        factor={feeFactors ? sumFeesFactors(feeFactors)?.toString() : undefined}
        value={discountedTotalFeeAmount}
        symbol={symbol}
        decimals={decimals}
      />
    </dl>
  );
};
