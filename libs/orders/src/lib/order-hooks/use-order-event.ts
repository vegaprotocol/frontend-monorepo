import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { OrderBusEventDocument } from './__generated__/Orders';
import type {
  OrderBusEventSubscription,
  OrderBusEventSubscriptionVariables,
  OrderFieldsFragment,
} from './__generated__/Orders'

import type { Subscription } from 'zen-observable-ts';

export const useOrderEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForOrderEvent = useCallback(
    (
      id: string,
      partyId: string,
      callback: (order: OrderFieldsFragment) => void
    ) => {
      subRef.current = client
        .subscribe<OrderBusEventSubscription, OrderBusEventSubscriptionVariables>({
          query: OrderBusEventDocument,
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
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  return waitForOrderEvent;
};
