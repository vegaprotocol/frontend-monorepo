import { sumFeesFactors } from '@vegaprotocol/markets';
import type { TradeFee, FeeFactors } from '@vegaprotocol/types';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import BigNumber from 'bignumber.js';
import { sumFees, sumFeesDiscounts } from '../../hooks';

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
  factor?: BigNumber;
  value: string;
  symbol?: string;
  decimals: number;
}) => (
  <>
    <dt className="col-span-2">{label}</dt>
    {factor && (
      <dd className="text-right col-span-1">
        {formatNumberPercentage(new BigNumber(factor).times(100), 2)}
      </dd>
    )}
    <dd className="text-right col-span-3">
      {formatValue(value, decimals)} {symbol || ''}
    </dd>
  </>
);

export const FeesBreakdown = ({
  fees,
  feeFactors,
  symbol,
  decimals,
}: {
  fees?: TradeFee;
  feeFactors?: FeeFactors;
  symbol?: string;
  decimals: number;
}) => {
  if (!fees) return null;
  const totalFees = sumFees(fees);
  const {
    total: totalDiscount,
    referral: referralDiscount,
    volume: volumeDiscount,
  } = sumFeesDiscounts(fees);
  if (totalFees === '0') return null;
  return (
    <dl className="grid grid-cols-6">
      <FeesBreakdownItem
        label={t('Infrastructure fee')}
        factor={
          feeFactors?.infrastructureFee
            ? new BigNumber(feeFactors?.infrastructureFee)
            : undefined
        }
        value={fees.infrastructureFee}
        symbol={symbol}
        decimals={decimals}
      />

      <FeesBreakdownItem
        label={t('Liquidity fee')}
        factor={
          feeFactors?.liquidityFee
            ? new BigNumber(feeFactors?.liquidityFee)
            : undefined
        }
        value={fees.liquidityFee}
        symbol={symbol}
        decimals={decimals}
      />

      <FeesBreakdownItem
        label={t('Maker fee')}
        factor={
          feeFactors?.makerFee ? new BigNumber(feeFactors?.makerFee) : undefined
        }
        value={fees.makerFee}
        symbol={symbol}
        decimals={decimals}
      />
      {volumeDiscount && volumeDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Volume discount')}
          factor={new BigNumber(volumeDiscount).dividedBy(
            BigNumber.sum(totalFees, totalDiscount)
          )}
          value={volumeDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
      {referralDiscount && referralDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Referral discount')}
          factor={new BigNumber(referralDiscount).dividedBy(
            BigNumber.sum(totalFees, totalDiscount)
          )}
          value={referralDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
      <FeesBreakdownItem
        label={t('Total fees')}
        factor={feeFactors ? sumFeesFactors(feeFactors) : undefined}
        value={totalFees}
        symbol={symbol}
        decimals={decimals}
      />
    </dl>
  );
};
