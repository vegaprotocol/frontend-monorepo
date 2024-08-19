import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, retrieveMarketDepth } from '../queries/market-depth';
import { Time } from '../utils/datetime';

export function useMarketDepth(marketId: string) {
  const client = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarketDepth({ marketId }, client),
    staleTime: Time.MIN,
  });

  return queryResult;
}
