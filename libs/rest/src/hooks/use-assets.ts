import {
  type QueryClient,
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

export function assetsOptions() {
  return queryOptions({
    queryKey: queryKeys.all,
    queryFn: () => retrieveAssets(),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useAssets() {
  const queryResult = useQuery(assetsOptions());
  return queryResult;
}

export function useSuspenseAssets() {
  const queryResult = useSuspenseQuery(assetsOptions());
  return queryResult;
}

export function assetOptions(queryClient: QueryClient, assetId?: string) {
  return queryOptions({
    queryKey: queryKeys.single(assetId),
    queryFn: () => retrieveAsset({ assetId }),
    // @ts-ignore queryOptions does not like this function even though its fine when used
    // in a normal query
    initialData: () => {
      if (!assetId) return;
      const assets = getAssetsFromCache(queryClient);
      return assets?.get(assetId);
    },
  });
}

export function useAsset(assetId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery(assetOptions(queryClient, assetId));

  return queryResult;
}
