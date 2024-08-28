import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { queryKeys, retrieveRewards } from '../queries/rewards';

function rewardsOptions() {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveRewards(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useRewards() {
  const queryResult = useQuery(rewardsOptions());
  return queryResult;
}

export function useSuspenseRewards() {
  const queryResult = useSuspenseQuery(rewardsOptions());
  return queryResult;
}
