import { useCallback, useEffect, useState } from 'react';
import { determineId } from '@vegaprotocol/react-helpers';

import { useVegaTransaction } from '../use-vega-transaction';
import { useVegaWallet } from '../use-vega-wallet';
import { useSubscription } from '@apollo/client';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__/OrderEvent';
import { ORDER_EVENT_SUB } from './order-event-query';
import * as Sentry from '@sentry/react';

export const useOrderCancel = () => {
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
          orderCancellation: {
            orderId: order.id,
            marketId: order.market.id,
          },
        });

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
