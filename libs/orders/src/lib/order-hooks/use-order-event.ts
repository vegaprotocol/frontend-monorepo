import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { ORDER_EVENT_SUB } from './order-event-query';
import type {
  OrderEvent,
  OrderEventVariables,
  OrderEvent_busEvents_event_Order,
} from './__generated__';
import type { Subscription } from 'zen-observable-ts';

export const useOrderEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForOrderEvent = useCallback(
    (
      id: string,
      partyId: string,
      callback: (order: OrderEvent_busEvents_event_Order) => void
    ) => {
      console.log('starting');
      subRef.current = client
        .subscribe<OrderEvent, OrderEventVariables>({
          query: ORDER_EVENT_SUB,
          variables: { partyId },
        })
        .subscribe(({ data }) => {
          console.log('data', data);
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
            console.log('found');
            callback(matchingOrderEvent.event);
            subRef.current?.unsubscribe();
          }
        });
    },
    [client]
  );

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  return waitForOrderEvent;
};
