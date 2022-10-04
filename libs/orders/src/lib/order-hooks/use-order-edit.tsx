import { removeDecimal, toNanoSeconds } from '@vegaprotocol/react-helpers';
import { useState, useCallback } from 'react';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderEvent_busEvents_event_Order } from './';
import * as Sentry from '@sentry/react';
import type { Order } from '../components';
import { useOrderEvent } from './use-order-event';

// Can only edit price for now
export interface EditOrderArgs {
  price: string;
}

export const useOrderEdit = (order: Order | null) => {
  const { pubKey } = useVegaWallet();

  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();

  const waitForOrderEvent = useOrderEvent(transaction);

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
  }, [resetTransaction]);

  const edit = useCallback(
    async (args: EditOrderArgs) => {
      if (!pubKey || !order || !order.market) {
        return;
      }

      setUpdatedOrder(null);

      try {
        await send(pubKey, {
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            price: removeDecimal(args.price, order.market.decimalPlaces),
            timeInForce: order.timeInForce,
            sizeDelta: 0,
            expiresAt: order.expiresAt
              ? toNanoSeconds(order.expiresAt) // Wallet expects timestamp in nanoseconds
              : undefined,
          },
        });

        waitForOrderEvent(order.id, pubKey, (updatedOrder) => {
          setUpdatedOrder(updatedOrder);
          setComplete();
        });
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, order, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    updatedOrder,
    Dialog,
    edit,
    reset,
  };
};
