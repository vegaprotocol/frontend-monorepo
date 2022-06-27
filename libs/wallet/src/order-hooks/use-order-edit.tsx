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

export const useOrderEdit = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [finalizedOrder, setFinalizedOrder] =
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
        setFinalizedOrder(matchingOrderEvent);
      }
    },
  });

  useEffect(() => {
    if (finalizedOrder) {
      resetTransaction();
    }
  }, [finalizedOrder, resetTransaction]);

  const edit = useCallback(
    async (order) => {
      if (!keypair) {
        return;
      }

      setFinalizedOrder(null);

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
    },
    [keypair, send]
  );

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
    setId('');
  }, [resetTransaction]);

  return {
    transactionEdit: transaction,
    finalizedEditOrder: finalizedOrder,
    id,
    edit,
    resetEdit: reset,
  };
};
