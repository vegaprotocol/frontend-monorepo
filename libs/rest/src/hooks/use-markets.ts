import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getMarket, queryKeys, retrieveMarkets } from '../queries/markets';

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
    queryFn: async () => {
      if (!marketId) return null;
      const market = await getMarket(queryClient, marketId);
      return market;
    },
  });
  return queryResult;
}
