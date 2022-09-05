import type { ReactNode } from 'react';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { useOrderSubmit, OrderFeedback } from '@vegaprotocol/orders';
import { OrderStatus } from '@vegaprotocol/types';
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
  const { submit, transaction, finalizedOrder, TransactionDialog } =
    useOrderSubmit();

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
      <TransactionDialog
        title={getOrderDialogTitle(finalizedOrder?.status)}
        intent={getOrderDialogIntent(finalizedOrder?.status)}
        icon={getOrderDialogIcon(finalizedOrder?.status)}
      >
        <OrderFeedback transaction={transaction} order={finalizedOrder} />
      </TransactionDialog>
    </>
  );
};

export const getOrderDialogTitle = (
  status?: OrderStatus
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_ACTIVE:
      return t('Order submitted');
    case OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Submission failed');
  }
};

export const getOrderDialogIntent = (
  status?: OrderStatus
): Intent | undefined => {
  if (!status) {
    return;
  }
  switch (status) {
    case OrderStatus.STATUS_PARKED:
    case OrderStatus.STATUS_EXPIRED:
    case OrderStatus.STATUS_PARTIALLY_FILLED:
      return Intent.Warning;
    case OrderStatus.STATUS_REJECTED:
    case OrderStatus.STATUS_STOPPED:
    case OrderStatus.STATUS_CANCELLED:
      return Intent.Danger;
    case OrderStatus.STATUS_FILLED:
    case OrderStatus.STATUS_ACTIVE:
      return Intent.Success;
    default:
      return;
  }
};

export const getOrderDialogIcon = (
  status?: OrderStatus
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.STATUS_PARKED:
    case OrderStatus.STATUS_EXPIRED:
      return <Icon name="warning-sign" />;
    case OrderStatus.STATUS_REJECTED:
    case OrderStatus.STATUS_STOPPED:
    case OrderStatus.STATUS_CANCELLED:
      return <Icon name="error" />;
    default:
      return;
  }
};
