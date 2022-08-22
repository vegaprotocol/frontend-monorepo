import { removeDecimal, toNanoSeconds } from '@vegaprotocol/react-helpers';
import { useState, useCallback } from 'react';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import type { OrderEvent_busEvents_event_Order } from './__generated__';
import * as Sentry from '@sentry/react';
import type { OrderFields } from '../components';
import { useOrderEvent } from './use-order-event';
import { OrderTimeInForce } from '@vegaprotocol/types';

// Can only edit price for now
export interface EditOrderArgs {
  price: string;
}

export const useOrderEdit = (order: OrderFields | null) => {
  const { keypair } = useVegaWallet();

  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    TransactionDialog,
  } = useVegaTransaction();

  const waitForOrderEvent = useOrderEvent();

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
  }, [resetTransaction]);

  const edit = useCallback(
    async (args: EditOrderArgs) => {
      if (!keypair || !order || !order.market) {
        return;
      }

      setUpdatedOrder(null);

      try {
        await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            price: {
              value: removeDecimal(args.price, order.market.decimalPlaces),
            },
            timeInForce: OrderTimeInForce[order.timeInForce],
            sizeDelta: 0,
            expiresAt: order.expiresAt
              ? {
                  value: toNanoSeconds(new Date(order.expiresAt)), // Wallet expects timestamp in nanoseconds
                }
              : undefined,
          },
        });

        waitForOrderEvent(order.id, keypair.pub, (updatedOrder) => {
          setUpdatedOrder(updatedOrder);
          setComplete();
        });
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send, order, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    updatedOrder,
    TransactionDialog,
    edit,
    reset,
  };
};
