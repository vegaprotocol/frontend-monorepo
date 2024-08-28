import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  queryKeys,
  retrieveMarketData,
  retrieveMarketsData,
} from '../queries/markets-data';
import { Time } from '../utils/datetime';

function marketsDataOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarketsData(queryClient),
    staleTime: Time.MIN,
  });
}

export function useMarketsData() {
  const queryClient = useQueryClient();
  const queryResult = useQuery(marketsDataOptions(queryClient));
  return queryResult;
}

export function useSuspenseMarketsData() {
  const queryClient = useQueryClient();
  const queryResult = useSuspenseQuery(marketsDataOptions(queryClient));
  return queryResult;
}

export function useMarketData(marketId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarketData(queryClient, { marketId }),
    staleTime: Time.MIN,
    refetchInterval: Time.MIN,
  });
  return queryResult;
}
