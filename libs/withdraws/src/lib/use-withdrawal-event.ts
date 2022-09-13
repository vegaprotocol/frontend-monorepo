import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import type { Subscription } from 'zen-observable-ts';
import { WithdrawalEventDocument } from './__generated__/Withdrawal';
import type {
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables,
  WithdrawalFieldsFragment,
} from './__generated__/Withdrawal';

type WaitForWithdrawalEvent = (
  id: string,
  partyId: string
) => Promise<WithdrawalFieldsFragment>;
export const useWithdrawalEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForWithdrawalEvent = useCallback<WaitForWithdrawalEvent>(
    (id, partyId) => {
      return new Promise((resolve) => {
        subRef.current = client
          .subscribe<WithdrawalEventSubscription, WithdrawalEventSubscriptionVariables>({
            query: WithdrawalEventDocument,
            variables: { partyId },
          })
          .subscribe(({ data }) => {
            if (!data?.busEvents?.length) {
              return;
            }

            // No types available for the subscription result
            const matchingWithdrawalEvent = data.busEvents.find((e) => {
              if (e.event.__typename !== 'Withdrawal') {
                return false;
              }

              return e.event.id === id;
            });

            if (
              matchingWithdrawalEvent &&
              matchingWithdrawalEvent.event.__typename === 'Withdrawal'
            ) {
              resolve(matchingWithdrawalEvent.event);
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

  return waitForWithdrawalEvent;
};
