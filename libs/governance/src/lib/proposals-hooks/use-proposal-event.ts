import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { ProposalEventDocument } from './__generated__/Proposal';
import type {
  ProposalEventSubscriptionVariables,
  ProposalEventSubscription,
  ProposalEventFieldsFragment,
} from './__generated__/Proposal';
import type { Subscription } from 'zen-observable-ts';
import type { VegaTxState } from '@vegaprotocol/wallet';

export const useProposalEvent = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForProposalEvent = useCallback(
    (
      id: string,
      partyId: string,
      callback: (proposal: ProposalEventFieldsFragment) => void
    ) => {
      subRef.current = client
        .subscribe<
          ProposalEventSubscription,
          ProposalEventSubscriptionVariables
        >({
          query: ProposalEventDocument,
          variables: { partyId },
        })
        .subscribe(({ data }) => {
          if (!data?.busEvents?.length) {
            return;
          }

          // No types available for the subscription result
          const matchingProposalEvent = data.busEvents.find((e) => {
            if (e.event.__typename !== 'Proposal') {
              return false;
            }

            return e.event.id === id;
          });

          if (
            matchingProposalEvent &&
            matchingProposalEvent.event.__typename === 'Proposal'
          ) {
            callback(matchingProposalEvent.event);
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

  return waitForProposalEvent;
};
