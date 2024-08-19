import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  type MarketsData,
  queryKeys,
  retrieveMarketsData,
} from '../queries/markets-data';
import { Time } from '../utils/datetime';

function marketsDataOptions(queryClient: QueryClient, marketId?: string) {
  const params = marketId ? { market: marketId } : undefined;
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarketsData(queryClient, params),
    staleTime: Time.MIN,
    // refetchInterval: Time.MIN,
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
    queryFn: () => {
      if (!marketId) return;
      const marketsData = queryClient.getQueryData<MarketsData>(
        queryKeys.list()
      );
      return marketsData?.get(marketId);
    },
    staleTime: Time.MIN,
  });
  return queryResult;
}
