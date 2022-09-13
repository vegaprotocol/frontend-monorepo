import type { ReactNode } from 'react';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { useOrderSubmit, OrderFeedback } from '@vegaprotocol/orders';
import { Schema } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

export interface DealTicketManagerProps {
  market: DealTicketQuery_market;
  children?: ReactNode | ReactNode[];
}

export const DealTicketManager = ({
  market,
  children,
}: DealTicketManagerProps) => {
  const { submit, transaction, finalizedOrder, Dialog } = useOrderSubmit();

  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={(order) => submit(order)}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
      <Dialog
        title={getOrderDialogTitle(finalizedOrder?.status)}
        intent={getOrderDialogIntent(finalizedOrder?.status)}
        icon={getOrderDialogIcon(finalizedOrder?.status)}
      >
        <OrderFeedback transaction={transaction} order={finalizedOrder} />
      </Dialog>
    </>
  );
};

export const getOrderDialogTitle = (
  status?: Schema.OrderStatus
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_ACTIVE:
      return t('Order submitted');
    case Schema.OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case Schema.OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case Schema.OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case Schema.OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case Schema.OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case Schema.OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Submission failed');
  }
};

export const getOrderDialogIntent = (
  status?: Schema.OrderStatus
): Intent | undefined => {
  if (!status) {
    return;
  }
  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return Intent.Warning;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return Intent.Danger;
    case Schema.OrderStatus.STATUS_FILLED:
    case Schema.OrderStatus.STATUS_ACTIVE:
      return Intent.Success;
    default:
      return;
  }
};

export const getOrderDialogIcon = (
  status?: Schema.OrderStatus
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
      return <Icon name="warning-sign" />;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return <Icon name="error" />;
    default:
      return;
  }
};
