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

export const useOrderEdit = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
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

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderAmendment: {
            orderId: order.id,
            marketId: order.market.id,
            timeInForce: order.timeInForce,
            // TODO add size delta
            sizeDelta: order.size,
            price: order.price,
            expiresAt: order.expiresAt,
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
    [keypair, send]
  );

  const reset = useCallback(() => {
    resetTransaction();
    setUpdatedOrder(null);
    setId('');
  }, [resetTransaction]);

  return {
    editTransaction: transaction,
    updatedOrder,
    id,
    edit,
    resetEdit: reset,
  };
};
