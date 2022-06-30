import { useSubscription } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import type { OrderAmendmentBody } from '@vegaprotocol/vegawallet-service-api-client';
import { useState, useCallback } from 'react';
import { useVegaTransaction } from '../use-vega-transaction';
import { useVegaWallet } from '../use-vega-wallet';
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

  // Start a subscription looking for the newly created order
  useSubscription<OrderEvent, OrderEventVariables>(ORDER_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !id,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data?.busEvents?.length) {
        return;
      }
      // No types available for the subscription result
      const matchingOrderEvent = subscriptionData.data.busEvents[0].event;

      if (matchingOrderEvent && matchingOrderEvent.__typename === 'Order') {
        setUpdatedOrder(matchingOrderEvent);
        resetTransaction();
      }
    },
  });

  const cancel = useCallback(
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
    transaction,
    finalizedOrder: updatedOrder,
    id,
    cancel,
    reset,
  };
};
