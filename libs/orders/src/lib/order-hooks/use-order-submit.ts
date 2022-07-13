import { useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import type { Order } from '../utils/get-default-order';
import { ORDER_EVENT_SUB } from './order-event-query';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__';
import { VegaWalletOrderType, useVegaWallet } from '@vegaprotocol/wallet';
import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import type { Market } from '../market';
import type { Subscription } from 'zen-observable-ts';

export const useOrderSubmit = (market: Market) => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
    // obs cancelled prematurely
    // subRef.current?.unsubscribe();
  }, [resetTransaction]);

  useEffect(() => {
    return () => {
      resetTransaction();
      setFinalizedOrder(null);
      subRef.current?.unsubscribe();
    };
  }, [resetTransaction]);

  const clientSub = client.subscribe<OrderEvent, OrderEventVariables>({
    query: ORDER_EVENT_SUB,
    variables: { partyId: keypair?.pub || '' },
  });

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair || !order.side) {
        return;
      }

      setFinalizedOrder(null);
      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderSubmission: {
            marketId: market.id,
            price:
              order.type === VegaWalletOrderType.Limit && order.price
                ? removeDecimal(order.price, market.decimalPlaces)
                : undefined,
            size: removeDecimal(order.size, market.positionDecimalPlaces),
            type: order.type,
            side: order.side,
            timeInForce: order.timeInForce,
            expiresAt: order.expiration
              ? // Wallet expects timestamp in nanoseconds, we don't have that level of accuracy so
                // just append 6 zeroes
                order.expiration.getTime().toString() + '000000'
              : undefined,
          },
        });

        if (res?.signature) {
          const resId = determineId(res.signature);
          if (resId) {
            // Start a subscription looking for the newly created order
            subRef.current = clientSub.subscribe(({ data }) => {
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
                setFinalizedOrder(matchingOrderEvent.event);
                // obs cancelled prematurely
                // subRef.current?.unsubscribe();
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
    [
      keypair,
      send,
      market.id,
      market.decimalPlaces,
      market.positionDecimalPlaces,
      clientSub,
    ]
  );

  return {
    transaction,
    finalizedOrder,
    submit,
    reset,
  };
};
