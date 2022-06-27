import { OrderStatus } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import type { Order, VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaOrderTransactionDialog } from '@vegaprotocol/wallet';
import { useEffect } from 'react';

interface CancelDialogProps {
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
  finalizedOrder: Order | null;
  transaction: VegaTxState;
  reset: () => void;
}

export const CancelDialog = ({
  orderDialogOpen,
  setOrderDialogOpen,
  finalizedOrder,
  transaction,
  reset,
}: CancelDialogProps) => {


  const getDialogIntent = () => {
    if (finalizedOrder) {
      if (finalizedOrder.status === OrderStatus.Cancelled) {
        return Intent.Success;
      }

      return Intent.Danger;
    }
    return Intent.None;
  };

  useEffect(() => {
    if (transaction.status !== VegaTxStatus.Default || finalizedOrder) {
      setOrderDialogOpen(true);
    } else {
      setOrderDialogOpen(false);
    }
  }, [finalizedOrder, setOrderDialogOpen, transaction.status]);

  return (
    <Dialog
      open={orderDialogOpen}
      onChange={(isOpen) => {
        setOrderDialogOpen(isOpen);

        // If closing reset
        if (!isOpen) {
          reset();
        }
      }}
      intent={getDialogIntent()}
    >
      <VegaOrderTransactionDialog
        transaction={transaction}
        finalizedOrder={finalizedOrder}
        title={
          finalizedOrder?.status === OrderStatus.Cancelled
            ? 'Order cancelled'
            : 'Cancellation failed'
        }
      />
    </Dialog>
  );
};
