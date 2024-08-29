import {
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getAsset, queryKeys, retrieveAssets } from '../queries/assets';

function assetOptions() {
  return queryOptions({
    queryKey: queryKeys.all,
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
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(assetId),
    queryFn: async () => {
      if (!assetId) return null;
      const asset = await getAsset(queryClient, assetId);
      return asset;
    },
  });

  return queryResult;
}
