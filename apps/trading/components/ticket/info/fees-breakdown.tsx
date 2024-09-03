import BigNumber from 'bignumber.js';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';

import { useT } from '../../../lib/use-t';
import { type useEstimateFees } from './use-estimate-fees';

const formatValue = (
  value: string | number | null | undefined,
  decimals: number
): string =>
  value && !isNaN(Number(value))
    ? addDecimalsFormatNumber(value, decimals)
    : '-';

const FeesBreakdownItem = ({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) => (
  <>
    <dt data-testid={`${testId}-label`}>{label}</dt>
    <dd className="text-right" data-testid={`${testId}-value`}>
      {value}
    </dd>
  </>
);

export const FeesBreakdown = ({
  estimate,
  decimals,
}: {
  estimate: ReturnType<typeof useEstimateFees>;
  decimals: number;
}) => {
  const t = useT();

  return (
    <dl className="grid grid-cols-2">
      <FeesBreakdownItem
        label={t('Fee')}
        value={formatValue(estimate.fee, decimals)}
        testId="fee"
      />
      <FeesBreakdownItem
        label={t('Discount')}
        value={`${formatValue(
          estimate.discount,
          decimals
        )} (${formatNumberPercentage(BigNumber(estimate.discountPct))})`}
        testId="fee-discount"
      />
      <FeesBreakdownItem
        label={t('Discounted fee')}
        value={formatValue(estimate.feeDiscounted, decimals)}
        testId="discounted-fee"
      />
      <FeesBreakdownItem
        label={t('Maker rebate')}
        value={`${formatValue(
          estimate.makerRebate,
          decimals
        )} (${formatNumberPercentage(BigNumber(estimate.makerRebatePct))})`}
        testId="maker-rebate"
      />
    </dl>
  );
};
