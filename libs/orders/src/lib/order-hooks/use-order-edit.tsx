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
  const [id, setId] = useState<string | null>(null);
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
    setId('');
  }, [resetTransaction]);

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
      setUpdatedOrder(null);
      resetTransaction();
    };
  }, [resetTransaction]);

  const clientSub = client.subscribe<OrderEvent, OrderEventVariables>({
    query: ORDER_EVENT_SUB,
    variables: { partyId: keypair?.pub || '' },
  });

  if (id) {
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

      if (
        matchingOrderEvent &&
        matchingOrderEvent.event.__typename === 'Order'
      ) {
        setUpdatedOrder(matchingOrderEvent.event);
        resetTransaction();
      }
    });
  }

  const edit = useCallback(
    async (order) => {
      if (!keypair) {
        return;
      }

      setUpdatedOrder(null);
      console.log('edit order', {
        orderId: order.id,
        marketId: order.market?.id || '',
        price: order.price,
        timeInForce: order.timeInForce,
        // 'sizeDelta'?: string;
        expiresAt: order.expiresAt,
      });

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market?.id || '',
            price: order.price,
            timeInForce: order.timeInForce,
            // 'sizeDelta'?: string;
            expiresAt: order.expiresAt,
          } as OrderAmendmentBodyOrderAmendment,
        } as OrderAmendmentBody);

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
    editTransaction: transaction,
    updatedOrder,
    id,
    edit,
    resetEdit: reset,
  };
};
