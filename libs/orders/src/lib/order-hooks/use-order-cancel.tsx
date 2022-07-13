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
import { OrderStatus } from '@vegaprotocol/types';
import { determineId } from '@vegaprotocol/react-helpers';
import type { Subscription } from 'zen-observable-ts';

export const useOrderCancel = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
      setUpdatedOrder(null);
      resetTransaction();
    };
  }, [resetTransaction]);

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
    subRef.current?.unsubscribe();
  }, [resetTransaction]);

  const cancel = useCallback(
    async (order) => {
      if (!keypair) {
        return;
      }

      if (
        [
          OrderStatus.Cancelled,
          OrderStatus.Rejected,
          OrderStatus.Expired,
          OrderStatus.Filled,
          OrderStatus.Stopped,
        ].includes(order.status)
      ) {
        return;
      }

      setUpdatedOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderCancellation: {
            orderId: order.id,
            marketId: order.market.id,
          },
        });

        if (res?.signature) {
          const resId = order.id ?? determineId(res.signature);
          setUpdatedOrder(null);
          // setId(resId);
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
                  setUpdatedOrder(matchingOrderEvent.event);
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
    [client, keypair, send]
  );

  return {
    transaction,
    updatedOrder,
    cancel,
    reset,
  };
};
