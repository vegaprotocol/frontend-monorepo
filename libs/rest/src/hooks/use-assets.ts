import {
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  getAssetsFromCache,
  queryKeys,
  retrieveAsset,
  retrieveAssets,
} from '../queries/assets';

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

export function useAsset(assetId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: queryKeys.single(assetId),
    queryFn: () => retrieveAsset({ assetId }),
    initialData: () => {
      if (!assetId) return;
      const assets = getAssetsFromCache(queryClient);
      return assets?.get(assetId);
    },
  });

  return queryResult;
}
