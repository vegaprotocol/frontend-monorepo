import uniqBy from 'lodash/uniqBy';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { gql, useQuery } from '@apollo/client';
import type { UpdateQueryFn } from '@apollo/client/core/watchQueryOptions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEffect, useMemo } from 'react';
import type {
  DepositEventSub,
  DepositEventSubVariables,
  DepositEventSub_busEvents_event,
  DepositEventSub_busEvents_event_Deposit,
} from './__generated__/DepositEventSub';
import type { Deposits, DepositsVariables } from './__generated__/Deposits';

const DEPOSIT_FRAGMENT = gql`
  fragment DepositFields on Deposit {
    id
    status
    amount
    asset {
      id
      symbol
      decimals
    }
    createdTimestamp
    creditedTimestamp
    txHash
  }
`;

const DEPOSITS_QUERY = gql`
  ${DEPOSIT_FRAGMENT}
  query DepositsQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      depositsConnection {
        edges {
          node {
            ...DepositFields
          }
        }
      }
    }
  }
`;

const DEPOSITS_BUS_EVENT_SUB = gql`
  ${DEPOSIT_FRAGMENT}
  subscription DepositEventSub($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
      event {
        ... on Deposit {
          ...DepositFields
        }
      }
    }
  }
`;

export const useDeposits = () => {
  const { keypair } = useVegaWallet();
  const { data, loading, error, subscribeToMore } = useQuery<
    Deposits,
    DepositsVariables
  >(DEPOSITS_QUERY, {
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
  });

  const deposits = useMemo(() => {
    if (!data?.party?.depositsConnection.edges?.length) {
      return [];
    }

    return orderBy(
      compact(data.party?.depositsConnection.edges?.map((d) => d?.node)),
      ['createdTimestamp'],
      ['desc']
    );
  }, [data]);

  useEffect(() => {
    if (!keypair?.pub) return;

    const unsub = subscribeToMore<DepositEventSub, DepositEventSubVariables>({
      document: DEPOSITS_BUS_EVENT_SUB,
      variables: { partyId: keypair?.pub },
      updateQuery,
    });

    return () => {
      unsub();
    };
  }, [keypair?.pub, subscribeToMore]);

  return { data, loading, error, deposits };
};

const updateQuery: UpdateQueryFn<
  Deposits,
  DepositEventSubVariables,
  DepositEventSub
> = (prev, { subscriptionData, variables }) => {
  console.log(subscriptionData);
  if (!subscriptionData.data.busEvents?.length || !variables?.partyId) {
    return prev;
  }

  const curr =
    compact(prev.party?.depositsConnection.edges?.map((e) => e?.node)) || [];
  const incoming = subscriptionData.data.busEvents
    .map((e) => e.event)
    .filter(isDepositEvent);

  const deposits = uniqBy([...incoming, ...curr], 'id');

  if (!prev.party) {
    return {
      ...prev,
      party: {
        __typename: 'Party',
        id: variables?.partyId,
        depositsConnection: {
          __typename: 'DepositsConnection',
          edges: deposits.map((d) => ({ __typename: 'DepositEdge', node: d })),
        },
      },
    };
  }

  return {
    ...prev,
    party: {
      ...prev.party,
      id: variables?.partyId,
      depositsConnection: {
        __typename: 'DepositsConnection',
        edges: deposits.map((d) => ({ __typename: 'DepositEdge', node: d })),
      },
    },
  };
};

const isDepositEvent = (
  event: DepositEventSub_busEvents_event
): event is DepositEventSub_busEvents_event_Deposit => {
  if (event.__typename === 'Deposit') {
    return true;
  }

  return false;
};
