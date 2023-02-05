import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { OrderSubDocument } from './__generated__/OrdersSubscription';
import type {
  OrderSubSubscription,
  OrderSubSubscriptionVariables,
  OrderSubFieldsFragment,
} from './__generated__/OrdersSubscription';
import type { Subscription } from 'zen-observable-ts';
import type { VegaTxState } from '@vegaprotocol/wallet';

type WaitFunc = (
  orderId: string,
  partyId: string
) => Promise<OrderSubFieldsFragment>;

export const useOrderUpdate = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForOrderUpdate = useCallback<WaitFunc>(
    (id: string, partyId: string) => {
      return new Promise((resolve) => {
        subRef.current = client
          .subscribe<OrderSubSubscription, OrderSubSubscriptionVariables>({
            query: OrderSubDocument,
            variables: { partyId },
          })
          .subscribe(({ data }) => {
            if (!data?.orders?.length) {
              return;
            }

            // No types available for the subscription result
            const matchingOrder = data.orders.find((order) => {
              return order.id === id;
            });

            if (matchingOrder) {
              resolve(matchingOrder);
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

  return waitForOrderUpdate;
};
