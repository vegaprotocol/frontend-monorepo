import { gql, useQuery } from '@apollo/client';
import { useVegaWallet } from '@vegaprotocol/wallet';
import uniqBy from 'lodash/uniqBy';
import { useEffect } from 'react';
import type {
  WithdrawalEvent,
  WithdrawalEventVariables,
  WithdrawalEvent_busEvents_event,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';
import type {
  Withdrawals,
  WithdrawalsVariables,
} from './__generated__/Withdrawals';

const WITHDRAWAL_FRAGMENT = gql`
  fragment WithdrawalFields on Withdrawal {
    id
    status
    amount
    asset {
      id
      symbol
      decimals
    }
    createdTimestamp
    withdrawnTimestamp
    txHash
    details {
      ... on Erc20WithdrawalDetails {
        receiverAddress
      }
    }
    pendingOnForeignChain @client
  }
`;

const WITHDRAWALS_QUERY = gql`
  ${WITHDRAWAL_FRAGMENT}
  query Withdrawals($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        ...WithdrawalFields
      }
    }
  }
`;

export const WITHDRAWAL_BUS_EVENT_SUB = gql`
  ${WITHDRAWAL_FRAGMENT}
  subscription WithdrawalEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Withdrawal]) {
      event {
        ... on Withdrawal {
          ...WithdrawalFields
        }
      }
    }
  }
`;

export const useWithdrawals = () => {
  const { keypair } = useVegaWallet();
  const { subscribeToMore, ...queryResult } = useQuery<
    Withdrawals,
    WithdrawalsVariables
  >(WITHDRAWALS_QUERY, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
  });

  useEffect(() => {
    if (!keypair?.pub) return;

    subscribeToMore<WithdrawalEvent, WithdrawalEventVariables>({
      document: WITHDRAWAL_BUS_EVENT_SUB,
      variables: { partyId: keypair.pub },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data.busEvents?.length) {
          return prev;
        }

        const curr = prev.party?.withdrawals || [];
        const incoming = subscriptionData.data.busEvents
          .map((e) => {
            return {
              ...e.event,
              pendingOnForeignChain: false,
            };
          })
          .filter(
            isWithdrawalEvent
            // Need this type cast here, TS can't infer that we've filtered any event types
            // that arent Withdrawals
          ) as WithdrawalEvent_busEvents_event_Withdrawal[];

        const withdrawals = uniqBy([...incoming, ...curr], 'id');

        // Write new party to cache if not present
        if (!prev.party) {
          return {
            ...prev,
            party: {
              __typename: 'Party',
              id: keypair.pub,
              withdrawals,
            },
          };
        }

        return {
          ...prev,
          party: {
            ...prev.party,
            withdrawals,
          },
        };
      },
    });
  }, [keypair?.pub, subscribeToMore]);

  return queryResult;
};

const isWithdrawalEvent = (
  event: WithdrawalEvent_busEvents_event
): event is WithdrawalEvent_busEvents_event_Withdrawal => {
  if (event.__typename === 'Withdrawal') {
    return true;
  }

  return false;
};
