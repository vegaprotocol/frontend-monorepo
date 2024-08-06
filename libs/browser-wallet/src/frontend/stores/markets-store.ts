import type { vegaMarket } from '@vegaprotocol/rest-clients/dist/trading-data';
import { create } from 'zustand';

import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider.tsx';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { getMarketPriceAssetId } from '@/lib/markets';
import { removePaginationWrapper } from '@/lib/remove-pagination';

export type MarketsStore = {
  markets: vegaMarket[];
  loading: boolean;
  error: Error | null;
  fetchMarkets: (request: SendMessage, networkId: string) => Promise<void>;
  getMarketById: (id: string) => vegaMarket;
  getMarketsByAssetId: (assetId: string) => vegaMarket[];
};

export const useMarketsStore = create<MarketsStore>((set, get) => ({
  markets: [],
  loading: true,
  error: null,
  async fetchMarkets(request, networkId) {
    try {
      set({ loading: true, error: null });
      const response = await request(
        RpcMethods.Fetch,
        { path: 'api/v2/markets', networkId },
        true
      );
      const markets = removePaginationWrapper<vegaMarket>(
        response.markets.edges
      );
      set({ markets });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },
  getMarketById(id: string) {
    const market = get().markets.find((market) => market.id === id);
    if (!market) {
      throw new Error(`Market with id ${id} not found`);
    }
    return market;
  },
  getMarketsByAssetId(assetId: string) {
    const markets = get().markets.filter(
      (market) => getMarketPriceAssetId(market) === assetId
    );
    return markets;
  },
}));
