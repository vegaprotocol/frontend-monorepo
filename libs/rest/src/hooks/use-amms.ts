import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type SearchParams,
  isActiveAMM,
  queryKeys,
  retrieveAMMs,
} from '../queries/amms';
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

export const useAMM = (params: { partyId?: string; marketId?: string }) => {
  const queryResult = useAMMs(params);
  const enabled = Boolean(params.partyId && params.marketId);
  const amm =
    enabled &&
    queryResult.data
      ?.filter(isActiveAMM)
      .find(
        (a) => a.partyId === params.partyId && a.marketId === params.marketId
      );

  return {
    ...queryResult,
    data: amm,
    enabled,
  };
};
