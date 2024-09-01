import {
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

export function useMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.all,
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Number.POSITIVE_INFINITY,
  });
  return queryResult;
}

export function useSuspenseMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useSuspenseQuery({
    queryKey: queryKeys.all,
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return queryResult;
}

export function useMarket(marketId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarket(queryClient, { marketId }),
    // Get data from the cache if list view has already been fetched
    initialData: () => {
      if (!marketId) return;
      const markets = getMarketsFromCache(queryClient);
      return markets?.get(marketId);
    },
  });
  return queryResult;
}
