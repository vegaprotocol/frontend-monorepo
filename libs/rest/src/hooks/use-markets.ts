import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { marketOptions, marketsOptions } from '../queries/markets';

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

export function useMarket(marketId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery(marketOptions(queryClient, marketId));
  return queryResult;
}
