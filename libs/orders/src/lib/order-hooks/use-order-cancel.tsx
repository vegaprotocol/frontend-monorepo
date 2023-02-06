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
import type { OrderSubFieldsFragment } from './';
import * as Sentry from '@sentry/react';
import { useOrderUpdate } from './use-order-update';

export const useOrderCancel = () => {
  const { pubKey } = useVegaWallet();

  const [cancelledOrder, setCancelledOrder] =
    useState<OrderSubFieldsFragment | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderUpdate = useOrderUpdate(transaction);
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
          const cancelledOrder = await waitForOrderUpdate(
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
    [pubKey, send, setComplete, waitForOrderUpdate, waitForTransactionResult]
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
