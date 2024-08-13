import { useQuery } from '@tanstack/react-query';
import { type AMMsQueryParams, queryKeys, retrieveAMMs } from '../queries/amms';
import { Time } from '../utils/datetime';

export const useAMMs = (params?: AMMsQueryParams) => {
  const queryResult = useQuery({
    queryKey: params ? queryKeys.filtered(params) : queryKeys.list(),
    queryFn: () => retrieveAMMs(params),
    staleTime: Time.MIN,
  });

  return queryResult;
};
