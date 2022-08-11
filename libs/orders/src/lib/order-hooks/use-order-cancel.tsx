import { useCallback, useState } from 'react';
import { useVegaWallet, useVegaTransaction } from '@vegaprotocol/wallet';
import type { OrderEvent_busEvents_event_Order } from './__generated__/OrderEvent';
import * as Sentry from '@sentry/react';
import { useOrderEvent } from './use-order-event';

interface CancelOrderArgs {
  orderId: string;
  marketId: string;
}

export const useOrderCancel = () => {
  const { keypair } = useVegaWallet();
  const waitForOrderEvent = useOrderEvent();

  const [cancelledOrder, setCancelledOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    TransactionDialog,
  } = useVegaTransaction();

  const reset = useCallback(() => {
    resetTransaction();
    setCancelledOrder(null);
  }, [resetTransaction]);

  const cancel = useCallback(
    async (args: CancelOrderArgs) => {
      if (!keypair) {
        return;
      }

      setCancelledOrder(null);

      try {
        await send({
          pubKey: keypair.pub,
          propagate: true,
          orderCancellation: {
            orderId: args.orderId,
            marketId: args.marketId,
          },
        });

        waitForOrderEvent(args.orderId, keypair.pub, (cancelledOrder) => {
          setCancelledOrder(cancelledOrder);
          setComplete();
        });
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send, setComplete, waitForOrderEvent]
  );

  return {
    transaction,
    cancelledOrder,
    TransactionDialog,
    cancel,
    reset,
  };
};
