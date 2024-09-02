import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { assetOptions, assetsOptions } from '../queries/assets';

export function useAssets() {
  const queryResult = useQuery(assetsOptions());
  return queryResult;
}

export function useSuspenseAssets() {
  const queryResult = useSuspenseQuery(assetsOptions());
  return queryResult;
}

export function useAsset(assetId?: string) {
  const queryClient = useQueryClient();
  const queryResult = useQuery(assetOptions(queryClient, assetId));

  return queryResult;
}
