import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import { getNodes, getEvents } from '@vegaprotocol/react-helpers';
import type { UpdateQueryFn } from '@apollo/client/core/watchQueryOptions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEffect, useMemo } from 'react';
import * as Schema from '@vegaprotocol/types';
import {
  useDepositsQuery,
  DepositEventDocument,
} from './__generated__/Deposit';
import type {
  DepositFieldsFragment,
  DepositsQuery,
  DepositEventSubscription,
  DepositEventSubscriptionVariables,
} from './__generated__/Deposit';

export const useDeposits = () => {
  const { pubKey } = useVegaWallet();
  const { data, loading, error, subscribeToMore } = useDepositsQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const deposits = useMemo(() => {
    if (!data?.party?.depositsConnection?.edges?.length) {
      return [];
    }

    return orderBy(
      getNodes<DepositFieldsFragment>(data.party?.depositsConnection),
      ['createdTimestamp'],
      ['desc']
    );
  }, [data]);

  useEffect(() => {
    if (!pubKey) return;

    const unsub = subscribeToMore<
      DepositEventSubscription,
      DepositEventSubscriptionVariables
    >({
      document: DepositEventDocument,
      variables: { partyId: pubKey },
      updateQuery,
    });

    return () => {
      unsub();
    };
  }, [pubKey, subscribeToMore]);

  return { data, loading, error, deposits };
};

const updateQuery: UpdateQueryFn<
  DepositsQuery,
  DepositEventSubscriptionVariables,
  DepositEventSubscription
> = (prev, { subscriptionData, variables }) => {
  if (!subscriptionData.data.busEvents?.length || !variables?.partyId) {
    return prev;
  }

  const curr = getNodes<DepositFieldsFragment>(prev.party?.depositsConnection);
  const incoming = getEvents<DepositFieldsFragment>(
    Schema.BusEventType.Deposit,
    subscriptionData.data.busEvents
  );

  console.log({ subscriptionData, time: new Date() });
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
