import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import type { Subscription } from 'zen-observable-ts';
import { WITHDRAWAL_BUS_EVENT_SUB } from './use-withdrawals';
import type {
  WithdrawalEvent,
  WithdrawalEventVariables,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';

type WaitForWithdrawalEvent = (
  id: string,
  partyId: string
) => Promise<WithdrawalEvent_busEvents_event_Withdrawal>;
export const useWithdrawalEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForWithdrawalEvent = useCallback<WaitForWithdrawalEvent>(
    (id, partyId) => {
      return new Promise((resolve) => {
        subRef.current = client
          .subscribe<WithdrawalEvent, WithdrawalEventVariables>({
            query: WITHDRAWAL_BUS_EVENT_SUB,
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
