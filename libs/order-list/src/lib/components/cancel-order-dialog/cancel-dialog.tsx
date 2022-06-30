import { OrderStatus } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import type { Order, VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaOrderTransactionDialog } from '@vegaprotocol/wallet';
import { useEffect } from 'react';

export interface CancelDialogProps {
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
    switch (finalizedOrder?.status) {
      case OrderStatus.Cancelled:
        return Intent.Success;
      case OrderStatus.Filled:
        return Intent.Warning;
      case OrderStatus.Expired:
        return Intent.Danger;
      default:
        return Intent.None;
    }
  };

  const getTitle = () => {
    switch (finalizedOrder?.status) {
      case OrderStatus.Cancelled:
        return 'Order cancelled';
      case OrderStatus.Filled:
        return 'Order filled';
      case OrderStatus.PartiallyFilled:
        return 'Order partially filled';
      case OrderStatus.Active:
        return 'Order submitted';
      case OrderStatus.Rejected:
        return 'Order rejected';
      case OrderStatus.Expired:
        return 'Order expired';
      default:
        return '';
    }
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
            ? getTitle()
            : 'Cancellation failed'
        }
      />
    </Dialog>
  );
};
