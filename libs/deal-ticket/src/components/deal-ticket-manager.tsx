import type { ReactNode } from 'react';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { useOrderSubmit } from '@vegaprotocol/orders';
import { OrderStatus } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { OrderFeedback } from './order-feedback';
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
        title={getDialogTitle(finalizedOrder?.status)}
        intent={getDialogIntent(finalizedOrder?.status)}
        icon={getDialogIcon(finalizedOrder?.status)}
      >
        <OrderFeedback transaction={transaction} order={finalizedOrder} />
      </TransactionDialog>
    </>
  );
};

const getDialogTitle = (status?: OrderStatus): string | undefined => {
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
    default:
      return t('Submission failed');
  }
};

const getDialogIntent = (status?: OrderStatus): Intent | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case OrderStatus.Parked:
    case OrderStatus.Expired:
      return Intent.Warning;
    case OrderStatus.Rejected:
    case OrderStatus.Stopped:
    case OrderStatus.Cancelled:
      return Intent.Danger;
    default:
      return;
  }
};

const getDialogIcon = (status?: OrderStatus): ReactNode | undefined => {
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
