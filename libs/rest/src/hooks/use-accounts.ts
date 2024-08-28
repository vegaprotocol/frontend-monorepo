import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { queryKeys, retrieveAccounts } from '../queries/accounts';
import { Time } from '../utils';

function accountsOptions(client: QueryClient) {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveAccounts(client),
    staleTime: Time.MIN,
  });
}

export function useAccounts() {
  const client = useQueryClient();
  const queryResult = useQuery(accountsOptions(client));
  return queryResult;
}

export function useSuspenseAccounts() {
  const client = useQueryClient();
  const queryResult = useSuspenseQuery(accountsOptions(client));
  return queryResult;
}
