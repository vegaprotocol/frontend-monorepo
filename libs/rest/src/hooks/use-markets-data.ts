import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  type MarketsData,
  queryKeys,
  retrieveMarketsData,
} from '../queries/markets-data';
import { Time } from '../utils/datetime';
import { getQueryClient } from '../rest-config';

function marketsDataOptions(marketId?: string) {
  const params = marketId ? { market: marketId } : undefined;
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveMarketsData(params),
    staleTime: Time.MIN,
    // refetchInterval: Time.MIN,
  });
}

export function useMarketsData() {
  const queryResult = useQuery(marketsDataOptions());
  return queryResult;
}

export function useSuspenseMarketsData() {
  const queryResult = useSuspenseQuery(marketsDataOptions());
  return queryResult;
}

export function useMarketData(marketId?: string) {
  const queryClient = getQueryClient();
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
