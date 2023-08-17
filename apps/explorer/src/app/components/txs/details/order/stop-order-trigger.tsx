import { StopOrderStatus } from '@vegaprotocol/types';
import { useExplorerStopOrderQuery } from '../../../order-details/__generated__/StopOrder';
import { t } from '@vegaprotocol/i18n';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@vegaprotocol/ui-toolkit';

export const StatusLabel: Record<StopOrderStatus, string> = {
  [StopOrderStatus.STATUS_CANCELLED]: t('Cancelled'),
  [StopOrderStatus.STATUS_EXPIRED]: t('Exported'),
  [StopOrderStatus.STATUS_PENDING]: t('Pending'),
  [StopOrderStatus.STATUS_REJECTED]: t('Rejected'),
  [StopOrderStatus.STATUS_STOPPED]: t('Stopped'),
  [StopOrderStatus.STATUS_TRIGGERED]: t('Triggered'),
  [StopOrderStatus.STATUS_UNSPECIFIED]: t('Unknown'),
};

export const StatusIcon: Record<StopOrderStatus, IconName> = {
  [StopOrderStatus.STATUS_CANCELLED]: 'disable',
  [StopOrderStatus.STATUS_EXPIRED]: 'outdated',
  [StopOrderStatus.STATUS_PENDING]: 'circle',
  [StopOrderStatus.STATUS_REJECTED]: 'cross',
  [StopOrderStatus.STATUS_STOPPED]: 'stop',
  [StopOrderStatus.STATUS_TRIGGERED]: 'tick',
  [StopOrderStatus.STATUS_UNSPECIFIED]: 'help',
};

export interface StopOrderTriggerSummaryProps {
  id: string;
}

/**
 */
const StopOrderTriggerSummary = ({ id }: StopOrderTriggerSummaryProps) => {
  const { data, error } = useExplorerStopOrderQuery({
    variables: { stopOrderId: id },
  });

  if (error || !data || (data && !data.stopOrder) || !data.stopOrder) {
    return <div data-testid="stop-order-trigger-summary">-</div>;
  }

  const stopOrderTrigger = data.stopOrder;
  return (
    <Tooltip
      side="right"
      data-testid="stop-order-trigger-summary"
      description={<p>{StatusLabel[stopOrderTrigger.status]}</p>}
    >
      <span>
        <Icon
          name={StatusIcon[stopOrderTrigger.status]}
          className="inline-block"
        />
      </span>
    </Tooltip>
  );
};

export default StopOrderTriggerSummary;
