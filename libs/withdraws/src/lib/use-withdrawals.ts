import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import type { UpdateQueryFn } from '@apollo/client/core/watchQueryOptions';
import { useVegaWallet } from '@vegaprotocol/wallet';
import uniqBy from 'lodash/uniqBy';
import { useEffect, useMemo } from 'react';
import { WithdrawalEventDocument } from './__generated__/Withdrawal';
import type {
  WithdrawalsQuery,
  WithdrawalEventSubscription,
  WithdrawalEventSubscriptionVariables,
  WithdrawalEdgeFieldsFragment,
} from './__generated__/Withdrawal';
import { useWithdrawalsQuery } from './__generated__/Withdrawal';

export const useWithdrawals = () => {
  const { keypair } = useVegaWallet();
  const { data, loading, error, subscribeToMore } = useWithdrawalsQuery({
    variables: { partyId: keypair?.pub || '' },
    skip: !keypair?.pub,
  });

  useEffect(() => {
    if (!keypair?.pub) return;

    const unsub = subscribeToMore<WithdrawalEventSubscription, WithdrawalEventSubscriptionVariables>({
      document: WithdrawalEventDocument,
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
  WithdrawalsQuery,
  WithdrawalEventSubscriptionVariables,
  WithdrawalEventSubscription
> = (prev, { subscriptionData, variables }) => {
  if (!subscriptionData.data.busEvents?.length) {
    return prev;
  }

  const curr = prev.party?.withdrawalsConnection.edges || [];
  const incoming = subscriptionData.data.busEvents
    .reduce<WithdrawalEdgeFieldsFragment[]>((acc, busEvent) => {
      if (busEvent.event.__typename === 'Withdrawal') {
        acc.push({
          __typename: 'WithdrawalEdge',
          node: {
            ...busEvent.event,
            pendingOnForeignChain: false,
          }
        })
      }
      return acc;
    }, []);

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
