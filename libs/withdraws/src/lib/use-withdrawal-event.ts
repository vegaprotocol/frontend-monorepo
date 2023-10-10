import { useApolloClient } from '@apollo/client';
import type { VegaTxState } from '@vegaprotocol/web3';
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

export const useWithdrawalEvent = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForWithdrawalEvent = useCallback<WaitForWithdrawalEvent>(
    (id, partyId) => {
      return new Promise<WithdrawalFieldsFragment>((resolve) => {
        subRef.current = client
          .subscribe<
            WithdrawalEventSubscription,
            WithdrawalEventSubscriptionVariables
          >({
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
    if (!transaction.dialogOpen) {
      subRef.current?.unsubscribe();
    }
    return () => {
      subRef.current?.unsubscribe();
    };
  }, [transaction.dialogOpen]);

  return waitForWithdrawalEvent;
};
