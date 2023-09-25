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
  <tr>
    <th className="text-left font-normal whitespace-nowrap">{label}</th>
    {factor && (
      <td className="text-right">
        {formatNumberPercentage(new BigNumber(factor).times(100), 2)}
      </td>
    )}
    <td className="text-right whitespace-nowrap" colSpan={!factor ? 2 : 1}>
      {formatValue(value, decimals)} {symbol || ''}
    </td>
  </tr>
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
  const totalFeesDiscount = sumFeesDiscounts(fees);
  if (totalFees === '0') return null;
  return (
    <table>
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
      <FeesBreakdownItem
        label={t('Total fees')}
        factor={feeFactors ? sumFeesFactors(feeFactors) : undefined}
        value={totalFees}
        symbol={symbol}
        decimals={decimals}
      />
      {fees.infrastructureFeeReferralDiscount &&
        fees.infrastructureFeeReferralDiscount !== '0' && (
          <FeesBreakdownItem
            label={t('Infrastructure fee referral discount')}
            factor={new BigNumber(
              fees.infrastructureFeeReferralDiscount
            ).dividedBy(
              BigNumber.sum(
                fees.infrastructureFee,
                fees.infrastructureFeeReferralDiscount
              )
            )}
            value={fees.infrastructureFeeReferralDiscount}
            symbol={symbol}
            decimals={decimals}
          />
        )}
      {fees.infrastructureFeeVolumeDiscount &&
        fees.infrastructureFeeVolumeDiscount !== '0' && (
          <FeesBreakdownItem
            label={t('Infrastructure fee volume discount')}
            factor={new BigNumber(
              fees.infrastructureFeeVolumeDiscount
            ).dividedBy(
              BigNumber.sum(
                fees.infrastructureFee,
                fees.infrastructureFeeVolumeDiscount
              )
            )}
            value={fees.infrastructureFeeVolumeDiscount}
            symbol={symbol}
            decimals={decimals}
          />
        )}
      {fees.liquidityFeeReferralDiscount &&
        fees.liquidityFeeReferralDiscount !== '0' && (
          <FeesBreakdownItem
            label={t('Liquidity fee referral discount')}
            factor={new BigNumber(fees.liquidityFeeReferralDiscount).dividedBy(
              BigNumber.sum(
                fees.liquidityFee,
                fees.liquidityFeeReferralDiscount
              )
            )}
            value={fees.liquidityFeeReferralDiscount}
            symbol={symbol}
            decimals={decimals}
          />
        )}
      {fees.liquidityFeeVolumeDiscount &&
        fees.liquidityFeeVolumeDiscount !== '0' && (
          <FeesBreakdownItem
            label={t('Liquidity fee volume discount')}
            factor={new BigNumber(fees.liquidityFeeVolumeDiscount).dividedBy(
              BigNumber.sum(fees.liquidityFee, fees.liquidityFeeVolumeDiscount)
            )}
            value={fees.liquidityFeeVolumeDiscount}
            symbol={symbol}
            decimals={decimals}
          />
        )}
      {fees.makerFeeReferralDiscount &&
        fees.makerFeeReferralDiscount !== '0' && (
          <FeesBreakdownItem
            label={t('Maker fee referral discount')}
            factor={new BigNumber(fees.makerFeeReferralDiscount).dividedBy(
              BigNumber.sum(fees.makerFee, fees.makerFeeReferralDiscount)
            )}
            value={fees.makerFeeReferralDiscount}
            symbol={symbol}
            decimals={decimals}
          />
        )}
      {fees.makerFeeVolumeDiscount && fees.makerFeeVolumeDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Maker fee volume discount')}
          factor={new BigNumber(fees.makerFeeVolumeDiscount).dividedBy(
            BigNumber.sum(fees.makerFee, fees.makerFeeVolumeDiscount)
          )}
          value={fees.makerFeeVolumeDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
      {totalFeesDiscount !== '0' && (
        <FeesBreakdownItem
          label={t('Total Discount')}
          factor={new BigNumber(totalFeesDiscount).dividedBy(
            BigNumber.sum(totalFees, totalFeesDiscount)
          )}
          value={totalFeesDiscount}
          symbol={symbol}
          decimals={decimals}
        />
      )}
    </table>
  );
};
