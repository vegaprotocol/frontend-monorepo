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
  const [id, setId] = useState('');
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
    subRef.current?.unsubscribe();
    resetTransaction();
    setUpdatedOrder(null);
    setId('');
  }, [resetTransaction]);

  const clientSub = client.subscribe<OrderEvent, OrderEventVariables>({
    query: ORDER_EVENT_SUB,
    variables: { partyId: keypair?.pub || '' },
  });

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

      return e.event.id === id;
    });

    if (matchingOrderEvent && matchingOrderEvent.event.__typename === 'Order') {
      setUpdatedOrder(matchingOrderEvent.event);
    }
  });

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
          if (order.id) {
            setId(order.id);
          } else {
            setId(determineId(res.signature));
          }
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send]
  );

  return {
    transaction,
    finalizedOrder: updatedOrder,
    id,
    cancel,
    reset,
  };
};
