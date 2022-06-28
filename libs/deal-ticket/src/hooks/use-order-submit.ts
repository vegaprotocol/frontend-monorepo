import { useCallback, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';
import type { Order } from '../utils/get-default-order';
import { OrderType, useVegaWallet } from '@vegaprotocol/wallet';
import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import type { DealTicketQuery_market } from '../components/__generated__/DealTicketQuery';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__/OrderEvent';

const ORDER_EVENT_SUB = gql`
  subscription OrderEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Order]) {
      eventId
      block
      type
      event {
        ... on Order {
          type
          id
          status
          rejectionReason
          createdAt
          size
          price
          market {
            name
            decimalPlaces
            positionDecimalPlaces
          }
        }
      }
    }
  }
`;

export const useOrderSubmit = (market: DealTicketQuery_market) => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [id, setId] = useState('');
  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);

  // Start a subscription looking for the newly created order
  useSubscription<OrderEvent, OrderEventVariables>(ORDER_EVENT_SUB, {
    variables: { partyId: keypair?.pub || '' },
    skip: !id,
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data?.busEvents?.length) {
        return;
      }

      // No types available for the subscription result
      const matchingOrderEvent = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Order') {
          return false;
        }

        return e.event.id === id;
      });

      if (
        matchingOrderEvent &&
        matchingOrderEvent.event.__typename === 'Order'
      ) {
        setFinalizedOrder(matchingOrderEvent.event);
        resetTransaction();
      }
    },
  });

  const submit = useCallback(
    async (order: Order) => {
      if (!keypair || !order.side) {
        return;
      }

      setFinalizedOrder(null);

      const res = await send({
        pubKey: keypair.pub,
        propagate: true,
        orderSubmission: {
          marketId: market.id,
          price:
            order.type === OrderType.Limit && order.price
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
        setId(determineId(res.signature));
      }
    },
    [market, keypair, send]
  );

  const reset = useCallback(() => {
    resetTransaction();
    setFinalizedOrder(null);
    setId('');
  }, [resetTransaction]);

  return {
    transaction,
    finalizedOrder,
    id,
    submit,
    reset,
  };
};
