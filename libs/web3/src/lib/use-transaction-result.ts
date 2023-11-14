import { useApolloClient } from '@apollo/client';
import * as Schema from '@vegaprotocol/types';
import { useCallback, useEffect, useRef } from 'react';
import { type Subscription } from 'zen-observable-ts';
import {
  TransactionEventDocument,
  type TransactionEventSubscription,
  type TransactionEventSubscriptionVariables,
} from './__generated__/TransactionResult';

export interface TransactionResult {
  partyId: string;
  hash: string;
  status: boolean;
  error?: string | null;
  __typename: 'TransactionResult';
}

type WaitFunc = (txHash: string, partyId: string) => Promise<TransactionResult>;

/**
 * Returns a function that can be called to subscribe to a transaction
 * result event and resolves when an event with a matching txhash is seen
 */
export const useTransactionResult = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForTransactionResult = useCallback<WaitFunc>(
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
              if (
                e.event.__typename !== Schema.BusEventType.TransactionResult
              ) {
                return false;
              }

              return e.event.hash.toLocaleLowerCase() === txHash.toLowerCase();
            });

            if (
              matchingTransaction &&
              matchingTransaction.event.__typename ===
                Schema.BusEventType.TransactionResult
            ) {
              resolve(matchingTransaction.event as TransactionResult);
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
