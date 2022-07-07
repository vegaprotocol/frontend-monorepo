import { OrderStatus } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from '../vega-order-transaction-dialog';
import { VegaOrderTransactionDialog } from '../vega-order-transaction-dialog';

export interface VegaTransactionDialogProps {
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
  finalizedOrder: Order | null;
  transaction: VegaTxState;
  reset: () => void;
  type: VegaOrderTransactionType;
}

export enum VegaOrderTransactionType {
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  EDIT = 'edit',
}

const getDialogTitle = (
  type: VegaOrderTransactionType,
  finalizedOrder: Order | null
) => {
  if (type === VegaOrderTransactionType.CANCEL) {
    switch (finalizedOrder?.status) {
      case OrderStatus.Cancelled:
        return 'Order cancelled';
      case OrderStatus.Rejected:
        return 'Order rejected';
      case OrderStatus.Expired:
        return 'Order expired';
      default:
        return 'Cancellation failed';
    }
  }
  if (type === VegaOrderTransactionType.SUBMIT) {
    switch (finalizedOrder?.status) {
      case OrderStatus.Active:
        return 'Order submitted';
      case OrderStatus.Filled:
        return 'Order filled';
      case OrderStatus.PartiallyFilled:
        return 'Order partially filled';
      case OrderStatus.Parked:
        return 'Order parked';
      default:
        return 'Submission failed';
    }
  }
  return 'Transaction failed';
};

const getDialogIntent = (
  type: VegaOrderTransactionType,
  finalizedOrder: Order | null,
  transaction: VegaTxState
) => {
  if (type === VegaOrderTransactionType.CANCEL) {
    switch (finalizedOrder?.status) {
      case OrderStatus.Cancelled:
        return Intent.Success;
      case OrderStatus.Filled:
        return Intent.Warning;
      case OrderStatus.Expired:
        return Intent.Danger;
      case OrderStatus.Rejected:
        return Intent.Danger;
      default:
        return Intent.None;
    }
  }
  if (type === VegaOrderTransactionType.SUBMIT) {
    switch (finalizedOrder?.status) {
      case OrderStatus.Active:
        return Intent.Success;
      case OrderStatus.Filled:
        return Intent.Success;
      case OrderStatus.PartiallyFilled:
        return Intent.Success;
      case OrderStatus.Rejected:
        return Intent.Danger;
      case OrderStatus.Parked:
        return Intent.Warning;
      default:
        return transaction.status === VegaTxStatus.Requested
          ? Intent.Warning
          : transaction.status === VegaTxStatus.Error
          ? Intent.Danger
          : Intent.None;
    }
  }

  return Intent.None;
};

export const VegaTransactionDialog = ({
  orderDialogOpen,
  setOrderDialogOpen,
  finalizedOrder,
  transaction,
  reset,
  type,
}: VegaTransactionDialogProps) => {
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
      intent={getDialogIntent(type, finalizedOrder, transaction)}
    >
      <VegaOrderTransactionDialog
        key={`${type}-tx-order-${transaction.txHash}`}
        transaction={transaction}
        finalizedOrder={finalizedOrder}
        title={getDialogTitle(type, finalizedOrder)}
      />
    </Dialog>
  );
};
