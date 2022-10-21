import { useCallback, useState } from 'react';
import { useVegaWallet, useVegaTransaction } from '@vegaprotocol/wallet';
import type { OrderEvent_busEvents_event_Order } from './';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';

export interface CancelOrderArgs {
  orderId: string;
  marketId: string;
}

export const useOrderCancel = () => {
  const { pubKey } = useVegaWallet();

  const [cancelledOrder, setCancelledOrder] =
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
    setCancelledOrder(null);
  }, [resetTransaction]);

  const cancel = useCallback(
    async (args: CancelOrderArgs) => {
      if (!pubKey) {
        return;
      }

      setCancelledOrder(null);

      try {
        await send(pubKey, {
          orderCancellation: {
            orderId: args.orderId,
            marketId: args.marketId,
          },
        });

        const cancelledOrder = await waitForOrderEvent(args.orderId, pubKey);
        setCancelledOrder(cancelledOrder);
        setComplete();
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [pubKey, send, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    cancelledOrder,
    Dialog,
    cancel,
    reset,
  };
};
