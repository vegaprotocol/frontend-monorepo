import { useAssetsStore } from '@/stores/assets-store';

export const useAsset = (assetId?: string) => {
  const { getAssetById, loading } = useAssetsStore((state) => ({
    getAssetById: state.getAssetById,
    loading: state.loading,
  }));
  if (loading || !assetId) return null;
  const assetInfo = getAssetById(assetId);
  return assetInfo;
};
