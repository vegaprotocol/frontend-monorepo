import { useApolloClient } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import type { OrderAmendmentBody } from '@vegaprotocol/vegawallet-service-api-client';
import { useState, useCallback, useEffect } from 'react';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { ORDER_EVENT_SUB } from './order-event-query';
import type {
  OrderEvent_busEvents_event_Order,
  OrderEvent,
  OrderEventVariables,
} from './__generated__';
import * as Sentry from '@sentry/react';
import type { Orders_party_orders } from '../components/__generated__/Orders';

export const useOrderEdit = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [newOrder, setNewOrder] = useState<Orders_party_orders | null>(null);
  const [updatedOrder, setUpdatedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const [id, setId] = useState('');
  const client = useApolloClient();

  useEffect(() => {
    const clientSub = client.subscribe<OrderEvent, OrderEventVariables>({
      query: ORDER_EVENT_SUB,
      variables: { partyId: keypair?.pub || '' },
    });

    // Start a subscription looking for the newly created order
    const sub = clientSub.subscribe(({ data }) => {
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
        setNewOrder(null);
        resetTransaction();
      }
    });

    return () => sub.unsubscribe();
  }, [client, keypair?.pub, id, resetTransaction]);

  const edit = useCallback(
    async (order) => {
      if (!keypair) {
        return;
      }

      setUpdatedOrder(null);
      if (order) {
        setNewOrder(order);
      }
      if (!newOrder) return;
      console.log('edit order', newOrder);
      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: newOrder.id,
            marketId: newOrder.market?.id || '',
            price: newOrder.price,
          },
        } as OrderAmendmentBody);

        if (res?.signature) {
          setId(determineId(res.signature));
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, newOrder, send]
  );

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
    setNewOrder(null);
    setId('');
  }, [resetTransaction]);

  return {
    editTransaction: transaction,
    updatedOrder,
    id,
    edit,
    resetEdit: reset,
    newOrder,
  };
};
