import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { DealTicket } from '@vegaprotocol/deal-ticket';
import { useOrderSubmit } from '../../hooks/use-order-submit';
import { useEffect, useState } from 'react';
import { VegaTxStatus } from '../../hooks/use-vega-transaction';
import { OrderDialog } from './order-dialog';
import { OrderStatus } from '../../__generated__/globalTypes';

export const DealTicketContainer = ({ market }) => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const { submit, transaction, finalizedOrder, reset } = useOrderSubmit(market);

  const getDialogIntent = (status: VegaTxStatus) => {
    if (finalizedOrder) {
      if (
        finalizedOrder.status === OrderStatus.Active ||
        finalizedOrder.status === OrderStatus.Filled ||
        finalizedOrder.status === OrderStatus.PartiallyFilled
      ) {
        return Intent.Success;
      }

      if (finalizedOrder.status === OrderStatus.Parked) {
        return Intent.Warning;
      }

      return Intent.Danger;
    }

    if (status === VegaTxStatus.Rejected) {
      return Intent.Danger;
    }

    return Intent.Progress;
  };

  useEffect(() => {
    if (transaction.status !== VegaTxStatus.Default) {
      setOrderDialogOpen(true);
    }
  }, [transaction.status]);

  return (
    <>
      <DealTicket
        market={market}
        submit={submit}
        transactionStatus={
          transaction.status === VegaTxStatus.AwaitingConfirmation ||
          transaction.status === VegaTxStatus.Pending
            ? 'pending'
            : 'default'
        }
      />
      <Dialog
        open={orderDialogOpen}
        onChange={(isOpen) => {
          setOrderDialogOpen(isOpen);

          // If closing reset
          if (!isOpen) {
            reset();
          }
        }}
        intent={getDialogIntent(transaction.status)}
      >
        <OrderDialog
          transaction={transaction}
          finalizedOrder={finalizedOrder}
        />
      </Dialog>
    </>
  );
};
