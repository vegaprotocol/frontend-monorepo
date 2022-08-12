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
    useOrderSubmit(market);

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
    case OrderStatus.Active:
      return t('Order submitted');
    case OrderStatus.Filled:
      return t('Order filled');
    case OrderStatus.PartiallyFilled:
      return t('Order partially filled');
    case OrderStatus.Parked:
      return t('Order parked');
    case OrderStatus.Stopped:
      return t('Order stopped');
    case OrderStatus.Cancelled:
      return t('Order cancelled');
    case OrderStatus.Expired:
      return t('Order expired');
    case OrderStatus.Rejected:
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
    case OrderStatus.Parked:
    case OrderStatus.Expired:
    case OrderStatus.PartiallyFilled:
      return Intent.Warning;
    case OrderStatus.Rejected:
    case OrderStatus.Stopped:
    case OrderStatus.Cancelled:
      return Intent.Danger;
    case OrderStatus.Filled:
    case OrderStatus.Active:
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
    case OrderStatus.Parked:
    case OrderStatus.Expired:
      return <Icon name="warning-sign" size={20} />;
    case OrderStatus.Rejected:
    case OrderStatus.Stopped:
    case OrderStatus.Cancelled:
      return <Icon name="error" size={20} />;
    default:
      return;
  }
};
