import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { VoteEventDocument } from './__generated___/VoteSubsciption';
import type { Subscription } from 'zen-observable-ts';
import type { VegaTxState } from '@vegaprotocol/wallet';
import type {
  VoteEventFieldsFragment,
  VoteEventSubscription,
  VoteEventSubscriptionVariables,
} from './__generated___/VoteSubsciption';

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
          if (!data?.busEvents?.length) {
            return;
          }

          const matchingVoteEvent = data.busEvents.find((e) => {
            if (e.event.__typename !== 'Vote') {
              return false;
            }

            return e.event.proposalId === proposalId;
          });

          if (
            matchingVoteEvent &&
            matchingVoteEvent.event.__typename === 'Vote'
          ) {
            callback(matchingVoteEvent.event);
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
