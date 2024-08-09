import { queryClient } from '../query-client';
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { type Markets, queryKeys, retrieveMarkets } from '../queries/markets';

function marketsOptions() {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarkets(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useMarkets() {
  const queryResult = useQuery(marketsOptions());
  return queryResult;
}

export function useSuspenseMarkets() {
  const queryResult = useSuspenseQuery(marketsOptions());

  return queryResult;
}

export function useMarket(marketId?: string) {
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
