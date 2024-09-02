import {
  type QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  getMarketsFromCache,
  queryKeys,
  retrieveMarket,
  retrieveMarkets,
} from '../queries/markets';

export function marketsOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: queryKeys.all,
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useQuery(marketsOptions(queryClient));
  return queryResult;
}

export function useSuspenseMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useSuspenseQuery(marketsOptions(queryClient));
  return queryResult;
}

export function marketOptions(queryClient: QueryClient, marketId?: string) {
  return queryOptions({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarket(queryClient, { marketId }),
    staleTime: Number.POSITIVE_INFINITY,
    // Get data from the cache if list view has already been fetched
    // @ts-ignore queryOptions does not like this function even though its fine when used
    // in a normal query
    initialData: () => {
      if (!marketId) return;
      const markets = getMarketsFromCache(queryClient);
      return markets?.get(marketId);
    },
  });
}

export function useMarket(marketId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery(marketOptions(queryClient, marketId));
  return queryResult;
}
