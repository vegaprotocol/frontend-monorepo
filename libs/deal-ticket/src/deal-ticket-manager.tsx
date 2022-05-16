import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { OrderStatus } from '@vegaprotocol/types';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import { useOrderSubmit } from './use-order-submit';
import { OrderDialog } from './order-dialog';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';

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

    if (status === VegaTxStatus.Error) {
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
      {children || (
        <DealTicket
          market={market}
          submit={submit}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
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
