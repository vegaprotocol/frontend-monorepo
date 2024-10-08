import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type SearchParams, queryKeys, retrieveAMMs } from '../queries/amms';
import { Time } from '../utils/datetime';

export const useAMMs = (params?: SearchParams) => {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: params ? queryKeys.filtered(params) : queryKeys.list(),
    queryFn: () => retrieveAMMs(queryClient, params),
    staleTime: Time.MIN,
  });

  return queryResult;
};
