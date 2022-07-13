import { useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import type { Order } from '../utils/get-default-order';
import { ORDER_EVENT_SUB } from './order-event-query';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__';
import { VegaWalletOrderType, useVegaWallet } from '@vegaprotocol/wallet';
import { determineId, removeDecimal } from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import type { Market } from '../market';
import type { Subscription } from 'zen-observable-ts';

export const useOrderSubmit = (market: Market) => {
  const { keypair } = useVegaWallet();
  const [finalizedOrder, setFinalizedOrder] =
    useState<OrderEvent_busEvents_event_Order | null>(null);
  const { send, transaction, reset: resetTransaction } = useVegaTransaction();
  const [id, setId] = useState<string | null>(null);
  const subRef = useRef<Subscription | null>(null);
  const client = useApolloClient();

  const reset = useCallback(() => {
    subRef.current?.unsubscribe();
    resetTransaction();
    setFinalizedOrder(null);
    setId(null);
  }, [resetTransaction]);

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
      setFinalizedOrder(null);
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
        setFinalizedOrder(matchingOrderEvent.event);
      }
    });
  }

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
            order.type === VegaWalletOrderType.Limit && order.price
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

  return {
    transaction,
    finalizedOrder,
    id,
    submit,
    reset,
  };
};
