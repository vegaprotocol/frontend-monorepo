import type { Market } from '@vegaprotocol/market-list';
import { totalFeesPercentage } from '@vegaprotocol/market-list';
import { t, formatNumberPercentage } from '@vegaprotocol/react-helpers';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';

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
}: {
  fees?: {
    infrastructureFee: string;
    liquidityFee: string;
    makerFee: string;
  };
  feeFactors?: Market['fees']['factors'];
}) => {
  if (!fees) return null;
  const totalFees = new BigNumber(fees.makerFee)
    .plus(fees.infrastructureFee)
    .plus(fees.liquidityFee)
    .toString();
  return (
    <dl className="grid grid-cols-3 gap-x-3">
      <dt>{t('Infrastructure fee')}</dt>
      <dd className="text-right">{fees.infrastructureFee}</dd>
      {feeFactors && (
        <dd className="text-right">
          {formatNumberPercentage(
            new BigNumber(feeFactors.infrastructureFee).times(100)
          )}
        </dd>
      )}
      <dt>{t('Liquidity fee')}</dt>
      <dd className="text-right">{fees.liquidityFee}</dd>
      {feeFactors && (
        <dd className="text-right">
          {formatNumberPercentage(
            new BigNumber(feeFactors.liquidityFee).times(100)
          )}
        </dd>
      )}
      <dt>{t('Maker fee')}</dt>
      <dd className="text-right">{fees.makerFee}</dd>
      {feeFactors && (
        <dd className="text-right">
          {formatNumberPercentage(
            new BigNumber(feeFactors.makerFee).times(100)
          )}
        </dd>
      )}
      <dt>{t('Total fees')}</dt>
      <dd className="text-right">{totalFees}</dd>
      {feeFactors && (
        <dd className="text-right">{totalFeesPercentage(feeFactors)}</dd>
      )}
    </dl>
  );
};
