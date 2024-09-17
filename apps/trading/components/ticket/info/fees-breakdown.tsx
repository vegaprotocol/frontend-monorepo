import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';

import { useT } from '../../../lib/use-t';
import { type useEstimateFees } from './use-estimate-fees';

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
        value={addDecimalsFormatNumber(estimate.fee.toString(), decimals)}
        testId="fee"
      />
      <FeesBreakdownItem
        label={t('Discount')}
        value={`${addDecimalsFormatNumber(
          estimate.discount.toString(),
          decimals
        )} (${formatNumberPercentage(estimate.discountPct)})`}
        testId="fee-discount"
      />
      <FeesBreakdownItem
        label={t('Discounted fee')}
        value={addDecimalsFormatNumber(
          estimate.feeDiscounted.toString(),
          decimals
        )}
        testId="discounted-fee"
      />
      <FeesBreakdownItem
        label={t('Maker rebate')}
        value={`${addDecimalsFormatNumber(
          estimate.makerRebate.toString(),
          decimals
        )} (${formatNumberPercentage(estimate.makerRebatePct)})`}
        testId="maker-rebate"
      />
    </dl>
  );
};
