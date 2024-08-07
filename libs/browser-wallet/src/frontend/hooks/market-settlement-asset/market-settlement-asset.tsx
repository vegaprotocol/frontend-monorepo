import { getMarketPriceAssetId } from '@/lib/markets';
import { useAssetsStore } from '@/stores/assets-store';

import { useMarket } from '../use-market';

export const useMarketPriceAsset = (marketId?: string) => {
  const market = useMarket(marketId);
  const { loading: assetsLoading, getAssetById } = useAssetsStore((state) => ({
    loading: state.loading,
    getAssetById: state.getAssetById,
  }));
  if (assetsLoading || !market) return;
  const settlementAssetId = getMarketPriceAssetId(market);
  return getAssetById(settlementAssetId);
};
