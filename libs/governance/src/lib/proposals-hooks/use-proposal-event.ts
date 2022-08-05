import { useApolloClient, gql } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import type {
  ProposalEvent,
  ProposalEventVariables,
  ProposalEvent_busEvents_event_Proposal,
} from './__generated__/ProposalEvent';
import type { Subscription } from 'zen-observable-ts';

export const PROPOSAL_EVENT_SUB = gql`
  subscription ProposalEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Proposal]) {
      type
      event {
        ... on Proposal {
          id
          reference
          state
          rejectionReason
          errorDetails
        }
      }
    }
  }
`;

export const useProposalEvent = () => {
  const client = useApolloClient();
  const subRef = useRef<Subscription | null>(null);

  const waitForProposalEvent = useCallback(
    (
      id: string,
      partyId: string,
      callback: (proposal: ProposalEvent_busEvents_event_Proposal) => void
    ) => {
      subRef.current = client
        .subscribe<ProposalEvent, ProposalEventVariables>({
          query: PROPOSAL_EVENT_SUB,
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
    return () => {
      subRef.current?.unsubscribe();
    };
  }, []);

  return waitForProposalEvent;
};
