import { t } from '@vegaprotocol/react-helpers';
import { OrderStatus } from '@vegaprotocol/types';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import type { Order } from '../vega-order-transaction-dialog';
import {
  VegaOrderTransactionDialog,
  VegaOrderTransactionType,
} from '../vega-order-transaction-dialog';

export interface VegaTransactionDialogProps {
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
  finalizedOrder: Order | null;
  newOrder?: Order | null;
  transaction: VegaTxState;
  reset: () => void;
  type?: VegaOrderTransactionType;
}

const getDialogTitle = (
  finalizedOrder: Order | null,
  newOrder?: Order | null,
  type?: VegaOrderTransactionType
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
  if (type === VegaOrderTransactionType.EDIT) {
    switch (newOrder?.status) {
      case OrderStatus.Active:
        return `Edit ${newOrder.market?.name} order`;
      case OrderStatus.PartiallyFilled:
        return 'Edit partially filled order';
      default:
        return 'Edit order';
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
  if (type) return 'Transaction failed';
  // If no type then it is not an order transaction
  return '';
};

const getDialogIntent = (
  finalizedOrder: Order | null,
  newOrder?: Order | null,
  type?: VegaOrderTransactionType,
  transaction?: VegaTxState
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
        return transaction?.status === VegaTxStatus.Requested
          ? Intent.Warning
          : transaction?.status === VegaTxStatus.Error
          ? Intent.Danger
          : Intent.None;
    }
  }
  if (type === VegaOrderTransactionType.EDIT) {
    switch (newOrder?.status) {
      case OrderStatus.Active:
        return Intent.None;
      case OrderStatus.Filled:
        return Intent.Success;
      case OrderStatus.PartiallyFilled:
        return Intent.Success;
      case OrderStatus.Rejected:
        return Intent.Danger;
      case OrderStatus.Parked:
        return Intent.Warning;
      default:
        return transaction?.status === VegaTxStatus.Requested
          ? Intent.Warning
          : transaction?.status === VegaTxStatus.Error
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
  newOrder,
  transaction,
  reset,
  type,
}: VegaTransactionDialogProps) => {
  useEffect(() => {
    if (
      transaction.status !== VegaTxStatus.Default ||
      (finalizedOrder && finalizedOrder.status !== OrderStatus.Rejected)
    ) {
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
      intent={getDialogIntent(finalizedOrder, newOrder, type, transaction)}
    >
      <VegaOrderTransactionDialog
        key={`${type}-tx-order-${transaction.txHash}`}
        transaction={transaction}
        newOrder={newOrder}
        finalizedOrder={finalizedOrder}
        title={t(getDialogTitle(finalizedOrder, newOrder, type))}
        type={type}
      />
    </Dialog>
  );
};
