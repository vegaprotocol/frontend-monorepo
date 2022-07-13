import { useApolloClient } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import type {
  OrderAmendmentBody,
  OrderAmendmentBodyOrderAmendment,
} from '@vegaprotocol/vegawallet-service-api-client';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Order } from '@vegaprotocol/wallet';
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
      if (!keypair) {
        return;
      }

      setUpdatedOrder(null);

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market?.id,
            price: { value: order.price },
            timeInForce: `TIME_IN_FORCE_${order.timeInForce}`,
            sizeDelta: 0,
          } as unknown as OrderAmendmentBodyOrderAmendment,
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
