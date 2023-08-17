import { StopOrderStatus } from '@vegaprotocol/types';
import { useExplorerStopOrderQuery } from '../../../order-details/__generated__/StopOrder';
import type { ExplorerStopOrderQuery } from '../../../order-details/__generated__/StopOrder';
import { t } from '@vegaprotocol/i18n';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@vegaprotocol/ui-toolkit';
import OrderTxSummary from '../../../order-summary/order-tx-summary';
import type { components } from '../../../../../types/explorer';
import type { ApolloError } from '@apollo/client';

export const StatusLabel: Record<StopOrderStatus, string> = {
  [StopOrderStatus.STATUS_CANCELLED]: t('Cancelled'),
  [StopOrderStatus.STATUS_EXPIRED]: t('Expired'),
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

export const StatusMidColor: Record<StopOrderStatus, string> = {
  [StopOrderStatus.STATUS_CANCELLED]: 'bg-red-100 text-red-900',
  [StopOrderStatus.STATUS_EXPIRED]: 'bg-red-100 text-red-900',
  [StopOrderStatus.STATUS_PENDING]: 'bg-yellow text-yellow-900',
  [StopOrderStatus.STATUS_REJECTED]: 'bg-red-100 text-red-900',
  [StopOrderStatus.STATUS_STOPPED]: 'bg-red-100 text-red-900',
  [StopOrderStatus.STATUS_TRIGGERED]: 'bg-green-100 text-green-900',
  [StopOrderStatus.STATUS_UNSPECIFIED]: 'bg-yellow-100 text-yellow-900',
};

export const StatusBottomColor: Record<StopOrderStatus, string> = {
  [StopOrderStatus.STATUS_CANCELLED]: 'bg-red-50 text-red-900 line-through',
  [StopOrderStatus.STATUS_EXPIRED]: 'bg-red-50 text-red-900 line-through',
  [StopOrderStatus.STATUS_PENDING]: 'bg-yellow-500',
  [StopOrderStatus.STATUS_REJECTED]: 'bg-red-50 text-red-900 line-through',
  [StopOrderStatus.STATUS_STOPPED]: 'bg-red-50 text-red-900 line-through',
  [StopOrderStatus.STATUS_TRIGGERED]: 'bg-green-50 text-green-900',
  [StopOrderStatus.STATUS_UNSPECIFIED]:
    'bg-yellow-50 text-yellow-900 line-through',
};

export function getStopOrderTriggerStatus(
  data?: ExplorerStopOrderQuery,
  error?: ApolloError
) {
  if (data && data.stopOrder) {
    return data.stopOrder.status;
  }

  return StopOrderStatus.STATUS_UNSPECIFIED;
}

export interface StopOrderTriggerSummaryProps {
  id: string;
  orderSubmission?: components['schemas']['v1OrderSubmission'];
}

/**
 */
const StopOrderTriggerSummary = ({
  id,
  orderSubmission,
}: StopOrderTriggerSummaryProps) => {
  const { data, error } = useExplorerStopOrderQuery({
    variables: { stopOrderId: id },
  });

  const status = getStopOrderTriggerStatus(data, error);

  return (
    <>
      <div
        className={`${StatusMidColor[status]} px-3 py-2 md:px-6 flex space-x-4`}
      >
        <p className="m-0 p-0 align-top">
          <Icon
            size={6}
            name={StatusIcon[status]}
            className="inline-block mr-2"
          />
          <span className="align-top">{StatusLabel[status]}</span>
        </p>
      </div>

      <div
        className={`${StatusBottomColor[status]} px-3 py-2 md:px-6 flex space-x-4`}
      >
        {orderSubmission && (
          <p className="text-vega-grey-400 strike">
            <OrderTxSummary order={orderSubmission} />
          </p>
        )}
      </div>
    </>
  );
};

export default StopOrderTriggerSummary;
