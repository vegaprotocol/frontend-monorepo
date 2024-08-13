import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { type Markets, queryKeys, retrieveMarkets } from '../queries/markets';

export function useMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Number.POSITIVE_INFINITY,
  });
  return queryResult;
}

export function useSuspenseMarkets() {
  const queryClient = useQueryClient();
  const queryResult = useSuspenseQuery({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarkets(queryClient),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return queryResult;
}

export function useMarket(marketId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(marketId),
    queryFn: () => {
      if (!marketId) return;
      const markets = queryClient.getQueryData<Markets>(queryKeys.list());
      return markets?.get(marketId);
    },
  });
  return queryResult;
}
