import { useApolloClient } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import type {
  OrderAmendmentBody,
  OrderAmendmentBodyOrderAmendment,
} from '@vegaprotocol/vegawallet-service-api-client';
import { useState, useCallback, useEffect, useRef } from 'react';
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
    async (order) => {
      if (!keypair || !order.market?.id) {
        return;
      }

      setUpdatedOrder(null);
      console.log('edit order', {
        orderId: order.id,
        marketId: order.market.id,
        price: order.price,
        timeInForce: order.timeInForce,
        sizeDelta: 0,
        expiresAt: order.expiresAt,
      });

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            price: order.price,
            timeInForce: order.timeInForce,
            sizeDelta: '0',
            expiresAt: order.expiration
              ? // Wallet expects timestamp in nanoseconds, we don't have that level of accuracy so
                // just append 6 zeroes
                order.expiration.getTime().toString() + '000000'
              : undefined,
          } as OrderAmendmentBodyOrderAmendment,
        } as OrderAmendmentBody);

        if (res?.signature) {
          const resId = determineId(res.signature);
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
    editTransaction: transaction,
    updatedOrder,
    edit,
    resetEdit: reset,
  };
};
