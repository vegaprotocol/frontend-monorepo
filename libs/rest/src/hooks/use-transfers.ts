import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  queryKeys,
  retrieveTransfers,
  type QueryParams,
} from '../queries/transfers';
import { v1TransferStatus } from '@vegaprotocol/rest-clients/dist/trading-data';

function transfersOptions(client: QueryClient, params?: QueryParams) {
  return queryOptions({
    queryKey: queryKeys.list(params),
    queryFn: () => retrieveTransfers(client, params),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useTransfers(params?: QueryParams) {
  const client = useQueryClient();
  const queryResult = useQuery(transfersOptions(client, params));
  return queryResult;
}

export function useSuspenseTransfers(params?: QueryParams) {
  const client = useQueryClient();
  const queryResult = useSuspenseQuery(transfersOptions(client, params));
  return queryResult;
}

export function useTransferRewards(params: { count: number }) {
  return useSuspenseTransfers({
    isReward: true,
    'pagination.first': params.count,
    status: v1TransferStatus.STATUS_DONE,
  });
}
