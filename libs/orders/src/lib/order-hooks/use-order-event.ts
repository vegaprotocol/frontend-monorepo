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

export const useOrderEvent = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForOrderEvent = useCallback(
    (
      id: string,
      partyId: string,
      callback: (order: OrderEvent_busEvents_event_Order) => void
    ) => {
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
            if (e.event.__typename !== 'Order') {
              return false;
            }

            return e.event.id === id;
          });

          if (
            matchingOrderEvent &&
            matchingOrderEvent.event.__typename === 'Order'
          ) {
            callback(matchingOrderEvent.event);
            subRef.current?.unsubscribe();
          }
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
