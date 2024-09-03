import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { accountsOptions, type QueryParams } from '../queries/accounts';

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
