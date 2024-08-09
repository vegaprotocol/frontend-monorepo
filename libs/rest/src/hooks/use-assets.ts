import { queryClient } from '../query-client';
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { type Assets, queryKeys, retrieveAssets } from '../queries/assets';

function assetOptions() {
  return queryOptions({
    queryKey: queryKeys.list(),
    queryFn: () => retrieveAssets(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useAssets() {
  const queryResult = useQuery(assetOptions());
  return queryResult;
}

export function useSuspenseAssets() {
  const queryResult = useSuspenseQuery(assetOptions());
  return queryResult;
}

export function useAsset(assetId?: string | null) {
  const queryResult = useQuery({
    queryKey: queryKeys.single(assetId),
    queryFn: () => {
      if (!assetId) return;
      const assets = queryClient.getQueryData<Assets>(queryKeys.list());
      return assets?.get(assetId);
    },
  });

  return queryResult;
}
