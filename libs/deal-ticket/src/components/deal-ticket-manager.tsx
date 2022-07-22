import type { ReactNode } from 'react';
import { useState } from 'react';
import { VegaTransactionDialog, VegaTxStatus } from '@vegaprotocol/wallet';
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
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const { submit, transaction, finalizedOrder, reset } = useOrderSubmit(market);

  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={(order) => {
            setOrderDialogOpen(true);
            submit(order);
          }}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
      <VegaTransactionDialog
        key={`submit-order-dialog-${transaction.txHash}`}
        isOpen={orderDialogOpen}
        onChange={(isOpen) => {
          if (!isOpen) reset();
          setOrderDialogOpen(isOpen);
        }}
        intent={getDialogIntent(finalizedOrder?.status)}
        title={getDialogTitle(finalizedOrder?.status)}
        icon={getDialogIcon(finalizedOrder?.status)}
        transaction={transaction}
      >
        <OrderFeedback transaction={transaction} order={finalizedOrder} />
      </VegaTransactionDialog>
    </>
  );
};

const getDialogTitle = (status?: OrderStatus) => {
  if (!status) {
    return undefined;
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

const getDialogIntent = (status?: OrderStatus) => {
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

const getDialogIcon = (status?: OrderStatus) => {
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
