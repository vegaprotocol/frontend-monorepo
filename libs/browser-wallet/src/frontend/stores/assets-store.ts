import { type vegaAsset } from '@vegaprotocol/rest-clients/dist/trading-data';
import { create } from 'zustand';

import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { removePaginationWrapper } from '@/lib/remove-pagination';

export type AssetsStore = {
  assets: vegaAsset[];
  loading: boolean;
  error: Error | null;
  fetchAssets: (request: SendMessage, networkId: string) => Promise<void>;
  getAssetById: (id: string) => vegaAsset;
};

export const useAssetsStore = create<AssetsStore>((set, get) => ({
  assets: [],
  loading: true,
  error: null,
  async fetchAssets(request, networkId) {
    try {
      set({ loading: true, error: null });
      const response = await request(
        RpcMethods.Fetch,
        { path: 'api/v2/assets', networkId },
        true
      );
      const assets = removePaginationWrapper<vegaAsset>(response.assets.edges);
      set({ assets });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },
  getAssetById(id: string) {
    const asset = get().assets.find((asset) => asset.id === id);
    if (!asset) {
      throw new Error(`Asset with id ${id} not found`);
    }
    return asset;
  },
}));
