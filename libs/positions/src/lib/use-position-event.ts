import { useApolloClient } from '@apollo/client';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useRef } from 'react';
import type { Subscription } from 'zen-observable-ts';
import type {
  TransactionEventSubscription,
  TransactionEventSubscriptionVariables,
} from './__generated___/TransactionResult';
import { TransactionEventDocument } from './__generated___/TransactionResult';

/**
 * Returns a function that can be called to subscribe to a transaction
 * result event and resolves when an event with a matching txhash is seen
 */
export const usePositionEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForTransactionResult = useCallback(
    (txHash: string, partyId: string) => {
      return new Promise((resolve) => {
        subRef.current = client
          .subscribe<
            TransactionEventSubscription,
            TransactionEventSubscriptionVariables
          >({
            query: TransactionEventDocument,
            variables: { partyId },
          })
          .subscribe(({ data }) => {
            if (!data?.busEvents?.length) {
              return;
            }

            const matchingTransaction = data.busEvents.find((e) => {
              if (e.event.__typename !== 'TransactionResult') {
                return false;
              }

              return e.event.hash === txHash;
            });

            if (
              matchingTransaction &&
              matchingTransaction.event.__typename === 'TransactionResult'
            ) {
              resolve(matchingTransaction.event);
              subRef.current?.unsubscribe();
            }
          });
      });
    },
    [client]
  );

  useEffect(() => {
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  return waitForTransactionResult;
};
