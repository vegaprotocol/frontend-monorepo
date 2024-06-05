import { useQuery, useQueryClient } from '@tanstack/react-query';
import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import {
  DepositsDocument,
  DepositEventDocument,
  type DepositsQuery,
  type DepositsQueryVariables,
  type DepositEventSubscription,
  type DepositEventSubscriptionVariables,
  type DepositFieldsFragment,
} from '@vegaprotocol/deposits';
import { useApolloClient } from '@apollo/client';
import { useEffect } from 'react';

export const useDeposits = ({ partyId = '' }: { partyId?: string }) => {
  const client = useApolloClient();
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: ['deposits', partyId],
    queryFn: async ({ queryKey }) => {
      const partyId = queryKey[1];

      if (!partyId) {
        return [];
      }

      const result = await client.query<DepositsQuery, DepositsQueryVariables>({
        query: DepositsDocument,
        variables: { partyId },
      });

      return compact(
        result.data.party?.depositsConnection?.edges?.map((e) => e?.node)
      );
    },
  });

  useEffect(() => {
    const sub = client
      .subscribe<DepositEventSubscription, DepositEventSubscriptionVariables>({
        query: DepositEventDocument,
        variables: {
          partyId,
        },
      })
      .subscribe(({ data }) => {
        queryClient.setQueryData(
          ['deposits', partyId],
          (curr: DepositFieldsFragment[]) => {
            if (!data?.busEvents?.length) return curr;

            const incoming = data.busEvents
              .filter((e) => {
                return e.event.__typename === 'Deposit';
              })
              .map((e) => e.event as DepositFieldsFragment);
            return uniqBy([...incoming, ...curr], 'id');
          }
        );
      });

    return () => {
      sub.unsubscribe();
    };
  }, [queryClient, client, partyId]);

  return queryResult;
};
