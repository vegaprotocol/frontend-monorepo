import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { ORDER_EVENT_SUB } from './order-event-query';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './';
import type { Subscription } from 'zen-observable-ts';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { BusEventType } from '@vegaprotocol/types';

type WaitFunc = (
  orderId: string,
  partyId: string
) => Promise<OrderEvent_busEvents_event_Order>;

export const useOrderEvent = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForOrderEvent = useCallback<WaitFunc>(
    (id: string, partyId: string) => {
      return new Promise((resolve) => {
        subRef.current = client
          .subscribe<OrderEvent, OrderEventVariables>({
            query: ORDER_EVENT_SUB,
            variables: { partyId },
          })
          .subscribe(({ data }) => {
            if (!data?.busEvents?.length) {
              return;
            }

            // No types available for the subscription result
            const matchingOrderEvent = data.busEvents.find((e) => {
              if (e.event.__typename !== BusEventType.Order) {
                return false;
              }

              return e.event.id === id;
            });

            if (
              matchingOrderEvent &&
              matchingOrderEvent.event.__typename === BusEventType.Order
            ) {
              resolve(matchingOrderEvent.event);
              subRef.current?.unsubscribe();
            }
          });
      });
    },
    [client]
  );

  useEffect(() => {
    if (!transaction.dialogOpen) {
      subRef.current?.unsubscribe();
    }

    return () => {
      subRef.current?.unsubscribe();
    };
  }, [transaction.dialogOpen]);

  return waitForOrderEvent;
};
