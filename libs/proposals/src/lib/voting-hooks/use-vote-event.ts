import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { VoteEventDocument } from './__generated__/VoteSubsciption';
import type { Subscription } from 'zen-observable-ts';
import type { VegaTxState } from '../proposals-hooks/use-vega-transaction';
import type {
  VoteEventFieldsFragment,
  VoteEventSubscription,
  VoteEventSubscriptionVariables,
} from './__generated__/VoteSubsciption';

export const useVoteEvent = (transaction: VegaTxState) => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForVoteEvent = useCallback(
    (
      proposalId: string,
      partyId: string,
      callback: (vote: VoteEventFieldsFragment) => void
    ) => {
      subRef.current = client
        .subscribe<VoteEventSubscription, VoteEventSubscriptionVariables>({
          query: VoteEventDocument,
          variables: { partyId },
        })
        .subscribe(({ data }) => {
          if (!data?.votes) {
            return;
          }

          const vote = data.votes;

          if (vote.proposalId === proposalId) {
            callback(vote);
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

  return waitForVoteEvent;
};
