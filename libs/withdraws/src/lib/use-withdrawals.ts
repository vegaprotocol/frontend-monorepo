import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import { gql, useQuery } from '@apollo/client';
import type { UpdateQueryFn } from '@apollo/client/core/watchQueryOptions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import uniqBy from 'lodash/uniqBy';
import { useEffect, useMemo } from 'react';
import type {
  WithdrawalEvent,
  WithdrawalEventVariables,
  WithdrawalEvent_busEvents_event,
  WithdrawalEvent_busEvents_event_Withdrawal,
} from './__generated__/WithdrawalEvent';
import type {
  Withdrawals,
  WithdrawalsVariables,
  Withdrawals_party_withdrawalsConnection_edges,
} from './__generated__/Withdrawals';

const WITHDRAWAL_FRAGMENT = gql`
  fragment WithdrawalFields on Withdrawal {
    id
    status
    amount
    asset {
      id
      name
      symbol
      decimals
      source {
        ... on ERC20 {
          contractAddress
        }
      }
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

export const WITHDRAWALS_QUERY = gql`
  ${WITHDRAWAL_FRAGMENT}
  query Withdrawals($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawalsConnection {
        edges {
          node {
            ...WithdrawalFields
          }
        }
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
  const { data, loading, error, subscribeToMore } = useQuery<
    Withdrawals,
    WithdrawalsVariables
  >(WITHDRAWALS_QUERY, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
  });

  useEffect(() => {
    if (!keypair?.pub) return;

    const unsub = subscribeToMore<WithdrawalEvent, WithdrawalEventVariables>({
      document: WITHDRAWAL_BUS_EVENT_SUB,
      variables: { partyId: keypair.pub },
      updateQuery,
    });

    return () => {
      unsub();
    };
  }, [keypair?.pub, subscribeToMore]);

  const withdrawals = useMemo(() => {
    if (!data?.party?.withdrawalsConnection?.edges) {
      return [];
    }

    return orderBy(
      compact(data.party.withdrawalsConnection.edges).map((edge) => edge.node),
      'createdTimestamp',
      'desc'
    );
  }, [data]);

  return {
    data,
    loading,
    error,
    withdrawals,
  };
};

export const updateQuery: UpdateQueryFn<
  Withdrawals,
  WithdrawalEventVariables,
  WithdrawalEvent
> = (prev, { subscriptionData, variables }) => {
  if (!subscriptionData.data.busEvents?.length) {
    return prev;
  }

  const curr = prev.party?.withdrawalsConnection.edges || [];
  const incoming = subscriptionData.data.busEvents
    .map((e) => {
      return {
        ...e.event,
        pendingOnForeignChain: false,
      };
    })
    .filter(isWithdrawalEvent)
    .map(
      (w) =>
        ({
          __typename: 'WithdrawalEdge',
          node: w,
        } as Withdrawals_party_withdrawalsConnection_edges)
    );

  const edges = uniqBy([...incoming, ...curr], 'node.id');

  // Write new party to cache if not present
  if (!prev.party) {
    return {
      ...prev,
      party: {
        id: variables?.partyId,
        __typename: 'Party',
        withdrawalsConnection: {
          __typename: 'WithdrawalsConnection',
          edges,
        },
      },
    } as Withdrawals;
  }

  return {
    ...prev,
    party: {
      ...prev.party,
      withdrawalsConnection: {
        __typename: 'WithdrawalsConnection',
        edges,
      },
    },
  };
};

const isWithdrawalEvent = (
  event: WithdrawalEvent_busEvents_event
): event is WithdrawalEvent_busEvents_event_Withdrawal => {
  if (event.__typename === 'Withdrawal') {
    return true;
  }

  return false;
};
