import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { marketDataOptions, marketsDataOptions } from '../queries/markets-data';

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
  const queryResult = useQuery(marketDataOptions(queryClient, marketId));
  return queryResult;
}
