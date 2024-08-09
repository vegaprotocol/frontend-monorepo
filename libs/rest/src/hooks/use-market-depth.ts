import { useQuery } from '@tanstack/react-query';
import { queryKeys, retrieveMarketDepth } from '../queries/market-depth';
import { Time } from '../utils/datetime';

export function useMarketDepth(marketId: string) {
  const queryResult = useQuery({
    queryKey: queryKeys.single(marketId),
    queryFn: () => retrieveMarketDepth(undefined, { marketId }),
    staleTime: Time.MIN,
  });

  return queryResult;
}
