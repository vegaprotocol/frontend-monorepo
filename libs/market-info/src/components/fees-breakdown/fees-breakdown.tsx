import type { Market } from '@vegaprotocol/market-list';
import { totalFees } from '@vegaprotocol/market-list';
import { t, formatNumberPercentage } from '@vegaprotocol/react-helpers';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';

export const FeesCell = ({
  feeFactors,
}: {
  feeFactors: Market['fees']['factors'];
}) => (
  <Tooltip description={<FeesBreakdown feeFactors={feeFactors} />}>
    <span>{totalFees(feeFactors) ?? '-'}</span>
  </Tooltip>
);

export const FeesBreakdown = ({
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
      <dd className="text-right">{totalFees(feeFactors)}</dd>
    </dl>
  );
};
