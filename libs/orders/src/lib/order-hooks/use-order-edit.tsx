import { useApolloClient } from '@apollo/client';
import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useVegaTransaction,
  useVegaWallet,
  VegaWalletOrderTimeInForce,
} from '@vegaprotocol/wallet';
import { ORDER_EVENT_SUB } from './order-event-query';
import type { Subscription } from 'zen-observable-ts';
import type {
  OrderEvent_busEvents_event_Order,
  OrderEvent,
  OrderEventVariables,
} from './__generated__';
import * as Sentry from '@sentry/react';
import type { OrderFields } from '../components';

// Can only edit price for now
export interface EditOrderArgs {
  price: string;
}

export const useOrderEdit = (order: OrderFields | null) => {
  const { keypair } = useVegaWallet();
  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
  } = useVegaTransaction();
  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
    subRef.current?.unsubscribe();
  }, [resetTransaction]);

  useEffect(() => {
    return () => {
      resetTransaction();
      setUpdatedOrder(null);
      subRef.current?.unsubscribe();
    };
  }, [resetTransaction]);

  const edit = useCallback(
    async (args: EditOrderArgs) => {
      if (!keypair || !order || !order.market) {
        return;
      }

      setUpdatedOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            // @ts-ignore fix me please!
            price: {
              value: removeDecimal(args.price, order.market.decimalPlaces),
            },
            timeInForce: VegaWalletOrderTimeInForce[order.timeInForce],
            // @ts-ignore fix me please!
            sizeDelta: 0,
            expiresAt: { value: order.expiresAt },
          },
        });

        if (res?.signature) {
          const resId = order.id ?? determineId(res.signature);
          setUpdatedOrder(null);

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
    [client, keypair, send, order, setComplete]
  );

  return {
    transaction,
    updatedOrder,
    edit,
    reset,
  };
};
