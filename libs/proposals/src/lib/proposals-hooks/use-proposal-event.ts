import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import {
  ProposalEventDocument,
  type ProposalEventSubscriptionVariables,
  type ProposalEventSubscription,
  type ProposalEventFieldsFragment,
} from './__generated__/Proposal';
import { type Subscription } from 'zen-observable-ts';
import { type VegaTxState } from '../proposals-hooks/use-vega-transaction';

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
          if (!data?.proposals) {
            return;
          }

          // typo in 'proposals' - this should be singular
          const proposal = data.proposals;

          if (proposal.id === id) {
            callback(proposal);
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
