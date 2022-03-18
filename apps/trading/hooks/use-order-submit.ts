import { useCallback, useEffect, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';
import { ethers } from 'ethers';
import { SHA3 } from 'sha3';
import { Order } from '@vegaprotocol/deal-ticket';
import { OrderType, useVegaWallet } from '@vegaprotocol/wallet';
import { useVegaTransaction } from './use-vega-transaction';
import {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from '@vegaprotocol/graphql';
import { removeDecimal } from '@vegaprotocol/react-helpers';

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
          }
        }
      }
    }
  }
`;

interface UseOrderSubmitMarket {
  id: string;
  decimalPlaces: number;
}

export const useOrderSubmit = (market: UseOrderSubmitMarket) => {
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
      if (!subscriptionData.data.busEvents.length) {
        return;
      }

      // No types available for the subscription result
      const matchingOrderEvent = subscriptionData.data.busEvents.find((e) => {
        if (e.event.__typename !== 'Order') {
          return false;
        }

        if (e.event.id === id) {
          return true;
        }

        return false;
      });

      if (
        matchingOrderEvent &&
        matchingOrderEvent.event.__typename === 'Order'
      ) {
        setFinalizedOrder(matchingOrderEvent.event);
      }
    },
  });

  useEffect(() => {
    if (finalizedOrder) {
      resetTransaction();
    }
  }, [finalizedOrder, resetTransaction]);

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
            order.type === OrderType.Market
              ? undefined
              : removeDecimal(order.price, market.decimalPlaces),
          size: order.size,
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
        setId(determineId(res.signature).toUpperCase());
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

/**
 * This function creates an ID in the same way that core does on the backend. This way we
 * Can match up the newly created order with incoming orders via a subscription
 */
export const determineId = (sig: string) => {
  // Prepend 0x
  if (sig.slice(0, 2) !== '0x') {
    sig = '0x' + sig;
  }

  // Create the ID
  const hash = new SHA3(256);
  const bytes = ethers.utils.arrayify(sig);
  hash.update(Buffer.from(bytes));
  const id = ethers.utils.hexlify(hash.digest());

  // Remove 0x as core doesn't keep them in the API
  return id.substring(2);
};
