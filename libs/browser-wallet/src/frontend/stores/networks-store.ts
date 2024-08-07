import { create } from 'zustand';

import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider';
import { RpcMethods } from '@/lib/client-rpc-methods';
import type { Network } from '@/types/backend';

interface NetworksResponse {
  networks: Network[];
}

export type NetworksStore = {
  networks: Network[];
  loading: boolean;
  selectedNetwork: Network | null;
  loadNetworks: (request: SendMessage) => Promise<void>;
  getNetworkById: (networkId: string) => Network | undefined;
  setSelectedNetwork: (
    request: SendMessage,
    networkId: string
  ) => Promise<void>;
};

export const useNetworksStore = create<NetworksStore>((set, get) => ({
  networks: [],
  loading: true,
  selectedNetwork: null,
  async loadNetworks(request) {
    try {
      const { networks } = (await request(
        RpcMethods.ListNetworks
      )) as NetworksResponse;
      const globals = await request(RpcMethods.AppGlobals);
      const selectedNetworkId = globals.settings.selectedNetwork;
      const network = networks.find(({ id }) => id === selectedNetworkId);
      if (selectedNetworkId && !network) {
        throw new Error(`Could not find selected network ${selectedNetworkId}`);
      }
      set({ networks, selectedNetwork: network ?? networks[0] });
    } finally {
      set({ loading: false });
    }
  },
  async setSelectedNetwork(request, networkId) {
    const network = get().getNetworkById(networkId);
    if (!network) throw new Error(`Could not find network ${networkId}`);
    await request(RpcMethods.UpdateSettings, { selectedNetwork: networkId });
    set({ selectedNetwork: network });
  },
  getNetworkById(networkId) {
    return get().networks.find(({ id }) => id === networkId);
  },
}));
