import { useApolloClient } from '@apollo/client';
import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Order } from '@vegaprotocol/wallet';
import { VegaWalletOrderTimeInForce } from '@vegaprotocol/wallet';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { ORDER_EVENT_SUB } from './order-event-query';
import type { Subscription } from 'zen-observable-ts';
import type {
  OrderEvent_busEvents_event_Order,
  OrderEvent,
  OrderEventVariables,
} from './__generated__';
import * as Sentry from '@sentry/react';

export const useOrderEdit = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
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
    async (order: Order) => {
      if (!keypair || !order.market || !order.market.id) {
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
              value: removeDecimal(order.price, order.market?.decimalPlaces),
            },
            timeInForce: VegaWalletOrderTimeInForce[order.timeInForce],
            // @ts-ignore fix me please!
            sizeDelta: 0,
            // @ts-ignore fix me please!
            expiresAt: order.expiresAt
              ? {
                  value:
                    // Wallet expects timestamp in nanoseconds,
                    // we don't have that level of accuracy so just append 6 zeroes
                    new Date(order.expiresAt).getTime().toString() + '000000',
                }
              : undefined,
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
    edit,
    reset,
  };
};
