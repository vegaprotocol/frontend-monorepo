import { totalFeesPercentage } from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  t,
} from '@vegaprotocol/react-helpers';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';

import type { Market } from '@vegaprotocol/market-list';
export const FeesCell = ({
  feeFactors,
}: {
  feeFactors: Market['fees']['factors'];
}) => (
  <Tooltip description={<FeesBreakdownPercentage feeFactors={feeFactors} />}>
    <span>{totalFeesPercentage(feeFactors) ?? '-'}</span>
  </Tooltip>
);

export const FeesBreakdownPercentage = ({
  feeFactors,
}: {
  feeFactors?: Market['fees']['factors'];
}) => {
  if (!feeFactors) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-2">
      <dt>{t('Infrastructure fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.infrastructureFee).times(100)
        )}
      </dd>
      <dt>{t('Liquidity fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(
          new BigNumber(feeFactors.liquidityFee).times(100)
        )}
      </dd>
      <dt>{t('Maker fee')}</dt>
      <dd className="text-right">
        {formatNumberPercentage(new BigNumber(feeFactors.makerFee).times(100))}
      </dd>
      <dt>{t('Total fees')}</dt>
      <dd className="text-right">{totalFeesPercentage(feeFactors)}</dd>
    </dl>
  );
};

export const FeesBreakdown = ({
  fees,
  feeFactors,
  quoteName,
  decimals,
}: {
  fees?: {
    infrastructureFee: string;
    liquidityFee: string;
    makerFee: string;
  };
  feeFactors?: Market['fees']['factors'];
  quoteName?: string;
  decimals: number;
}) => {
  if (!fees) return null;
  const totalFees = new BigNumber(fees.makerFee)
    .plus(fees.infrastructureFee)
    .plus(fees.liquidityFee)
    .toString();
  const formatValue = (value: string | number | null | undefined): string => {
    return value && !isNaN(Number(value))
      ? addDecimalsFormatNumber(value, decimals)
      : '-';
  };
  return (
    <dl className="grid grid-cols-5">
      <dt className="col-span-2">{t('Infrastructure fee')}</dt>
      {feeFactors && (
        <dd className="text-right col-span-1">
          {formatNumberPercentage(
            new BigNumber(feeFactors.infrastructureFee).times(100)
          )}
        </dd>
      )}
      <dd className="text-right col-span-2">
        {formatValue(fees.infrastructureFee)} {quoteName || ''}
      </dd>
      <dt className="col-span-2">{t('Liquidity fee')}</dt>
      {feeFactors && (
        <dd className="text-right col-span-1">
          {formatNumberPercentage(
            new BigNumber(feeFactors.liquidityFee).times(100)
          )}
        </dd>
      )}
      <dd className="text-right col-span-2">
        {formatValue(fees.liquidityFee)} {quoteName || ''}
      </dd>
      <dt className="col-span-2">{t('Maker fee')}</dt>
      {feeFactors && (
        <dd className="text-right col-span-1">
          {formatNumberPercentage(
            new BigNumber(feeFactors.makerFee).times(100)
          )}
        </dd>
      )}
      <dd className="text-right col-span-2">
        {formatValue(fees.makerFee)} {quoteName || ''}
      </dd>
      <dt className="col-span-2">{t('Total fees')}</dt>
      {feeFactors && (
        <dd className="text-right col-span-1">
          {totalFeesPercentage(feeFactors)}
        </dd>
      )}
      <dd className="text-right col-span-2">
        {formatValue(totalFees)} {quoteName || ''}
      </dd>
    </dl>
  );
};
