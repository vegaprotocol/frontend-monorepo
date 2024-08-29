import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  queryKeys,
  type QueryParams,
  retrieveAccounts,
} from '../queries/accounts';
import { Time } from '../utils';

function accountsOptions(client: QueryClient, params: QueryParams) {
  return queryOptions({
    queryKey: queryKeys.list(params),
    queryFn: () => retrieveAccounts(client, params),
    staleTime: Time.MIN,
  });
}

export function useAccounts(params: QueryParams) {
  const client = useQueryClient();
  const queryResult = useQuery(accountsOptions(client, params));
  return queryResult;
}

export function useSuspenseAccounts(params: QueryParams) {
  const client = useQueryClient();
  const queryResult = useSuspenseQuery(accountsOptions(client, params));
  return queryResult;
}
