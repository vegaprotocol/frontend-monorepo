import type { UpdateQueryFn } from '@apollo/client/core/watchQueryOptions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import uniqBy from 'lodash/uniqBy';
import { useEffect } from 'react';
import {
  useWithdrawalsQuery,
  WithdrawalEventDocument,
} from './__generated__/Withdrawal';
import type {
  WithdrawalsQuery,
  WithdrawalFieldsFragment,
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables,
} from './__generated__/Withdrawal';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';

type WithdrawalEdges = { node: WithdrawalFieldsFragment }[];

export const useWithdrawals = () => {
  const { pubKey } = useVegaWallet();
  const { data, loading, error, subscribeToMore } = useWithdrawalsQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  useEffect(() => {
    if (!pubKey) return;

    const unsubscribe = subscribeToMore<
      WithdrawalEventSubscription,
      WithdrawalEventSubscriptionVariables
    >({
      document: WithdrawalEventDocument,
      variables: { partyId: pubKey },
      updateQuery,
    });

    return () => {
      unsubscribe();
    };
  }, [pubKey, subscribeToMore]);

  return {
    data: removePaginationWrapper(
      data?.party?.withdrawalsConnection?.edges ?? []
    ).sort((a, b) => {
      if (!b.txHash !== !a.txHash) {
        return b.txHash ? -1 : 1;
      }
      return (
        b.txHash ? b.withdrawnTimestamp : b.createdTimestamp
      ).localeCompare(a.txHash ? a.withdrawnTimestamp : a.createdTimestamp);
    }),
    loading,
    error,
  };
};

export const updateQuery: UpdateQueryFn<
  WithdrawalsQuery,
  WithdrawalEventSubscriptionVariables,
  WithdrawalEventSubscription
> = (prev, { subscriptionData, variables }) => {
  if (!subscriptionData.data.busEvents?.length) {
    return prev;
  }

  const curr = prev.party?.withdrawalsConnection?.edges || [];
  const incoming = subscriptionData.data.busEvents.reduce<WithdrawalEdges>(
    (acc, event) => {
      if (event.event.__typename === 'Withdrawal') {
        acc.push({
          node: {
            ...event.event,
            pendingOnForeignChain: false,
          },
        });
      }
      return acc;
    },
    []
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
    } as WithdrawalsQuery;
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
