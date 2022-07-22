import { useCallback, useEffect, useRef, useState } from 'react';
import { useVegaWallet, useVegaTransaction } from '@vegaprotocol/wallet';
import { useApolloClient } from '@apollo/client';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__/OrderEvent';
import { ORDER_EVENT_SUB } from './order-event-query';
import * as Sentry from '@sentry/react';
import { determineId } from '@vegaprotocol/react-helpers';
import type { Subscription } from 'zen-observable-ts';

interface CancelOrderArgs {
  orderId: string;
  marketId: string;
}

export const useOrderCancel = () => {
  const { keypair } = useVegaWallet();
  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
  } = useVegaTransaction();
  const [cancelledOrder, setCancelledOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
      setCancelledOrder(null);
      resetTransaction();
    };
  }, [resetTransaction]);

  const reset = useCallback(() => {
    resetTransaction();
    setCancelledOrder(null);
    subRef.current?.unsubscribe();
  }, [resetTransaction]);

  const cancel = useCallback(
    async (args: CancelOrderArgs) => {
      if (!keypair) {
        return;
      }

      setCancelledOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderCancellation: {
            orderId: args.orderId,
            marketId: args.marketId,
          },
        });

        if (res?.signature) {
          const resId = args.orderId ?? determineId(res.signature);
          setCancelledOrder(null);

          if (resId) {
            // Start a subscription looking for the newly created order
            subRef.current = client
              .subscribe<OrderEvent, OrderEventVariables>({
                query: ORDER_EVENT_SUB,
                variables: { partyId: keypair?.pub || '' },
              })
              .subscribe(({ data }) => {
                if (!data?.busEvents?.length) {
                  return;
                }

                // No types available for the subscription result
                const matchingOrderEvent = data.busEvents.find((e) => {
                  if (e.event.__typename !== 'Order') {
                    return false;
                  }

                  return e.event.id === resId;
                });

                if (
                  matchingOrderEvent &&
                  matchingOrderEvent.event.__typename === 'Order'
                ) {
                  setCancelledOrder(matchingOrderEvent.event);
                  setComplete();
                  subRef.current?.unsubscribe();
                }
              });
          }
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [client, keypair, send, setComplete]
  );

  return {
    transaction,
    cancelledOrder,
    cancel,
    reset,
  };
};
