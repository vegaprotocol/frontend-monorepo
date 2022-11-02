import { useCallback, useState } from 'react';
import {
  useVegaWallet,
  useVegaTransaction,
  useTransactionResult,
} from '@vegaprotocol/wallet';
import type {
  OrderCancellationBody,
  TransactionResult,
} from '@vegaprotocol/wallet';
import type { OrderEventFieldsFragment } from './';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';

export const useOrderCancel = () => {
  const { pubKey } = useVegaWallet();

  const [cancelledOrder, setCancelledOrder] =
    useState<OrderEventFieldsFragment | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderEvent = useOrderEvent(transaction);
  const waitForTransactionResult = useTransactionResult();

  const reset = useCallback(() => {
    resetTransaction();
    setCancelledOrder(null);
  }, [resetTransaction]);

  const cancel = useCallback(
    async (orderCancellation: OrderCancellationBody['orderCancellation']) => {
      if (!pubKey) {
        return;
      }

      setCancelledOrder(null);

      try {
        const res = await send(pubKey, {
          orderCancellation,
        });
        if (orderCancellation.orderId) {
          const cancelledOrder = await waitForOrderEvent(
            orderCancellation.orderId,
            pubKey
          );
          setCancelledOrder(cancelledOrder);
          setComplete();
        } else if (res) {
          const txResult = await waitForTransactionResult(
            res.transactionHash,
            pubKey
          );
          setTransactionResult(txResult);
          setComplete();
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, setComplete, waitForOrderEvent, waitForTransactionResult]
  );

  return {
    transaction,
    transactionResult,
    cancelledOrder,
    Dialog,
    cancel,
    reset,
  };
};
