import { useMarketsStore } from '@/stores/markets-store';

export const useMarket = (marketId?: string) => {
  const { getMarketById, loading } = useMarketsStore((state) => ({
    getMarketById: state.getMarketById,
    loading: state.loading,
  }));
  if (loading || !marketId) return null;
  const marketInfo = getMarketById(marketId);
  return marketInfo;
};
