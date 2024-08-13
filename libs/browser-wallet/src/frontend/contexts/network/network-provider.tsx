import { useEffect } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useGlobalsStore } from '@/stores/globals';
import { useInteractionStore } from '@/stores/interaction-store';
import { useNetworksStore } from '@/stores/networks-store';

import { NetworkContext } from './network-context';

export const locators = {
  networkProviderLoading: 'network-provider-loading',
};

export const useNetworkFromChainId = (chainId?: string) => {
  const { networks } = useNetworksStore((store) => ({
    networks: store.networks,
  }));
  if (!chainId) return null;
  const network = networks.find((n) => n.chainId === chainId);
  return network;
};

/**
 * Provides a network through useNetworkProvider. If the app is in interaction mode with the network specified in the currentConnectionDetails or currentTransactionDetails then that network is provided. Otherwise the selected network is provided.
 * @param param0
 * @returns
 */
export const NetworkProvider = ({ children }: { children: JSX.Element }) => {
  const { request } = useJsonRpcClient();
  const { loadGlobals, loading: loadingGlobals } = useGlobalsStore((store) => ({
    loadGlobals: store.loadGlobals,
    loading: store.loading,
  }));
  const {
    loadNetworks,
    loading: loadingNetworks,
    selectedNetwork,
  } = useNetworksStore((state) => ({
    loadNetworks: state.loadNetworks,
    loading: state.loading,
    selectedNetwork: state.selectedNetwork,
  }));

  const {
    transactionModalOpen,
    connectionModalOpen,
    currentConnectionDetails,
    currentTransactionDetails,
  } = useInteractionStore((store) => ({
    transactionModalOpen: store.transactionModalOpen,
    connectionModalOpen: store.connectionModalOpen,
    currentConnectionDetails: store.currentConnectionDetails,
    currentTransactionDetails: store.currentTransactionDetails,
  }));
  const networkFromChainId = useNetworkFromChainId(
    currentConnectionDetails?.chainId ?? currentTransactionDetails?.chainId
  );

  useEffect(() => {
    loadGlobals(request);
    loadNetworks(request);
  }, [loadGlobals, loadNetworks, request]);
  if (loadingGlobals || loadingNetworks) {
    return (
      <div
        data-testid={locators.networkProviderLoading}
        className="h-full w-full bg-black"
      />
    );
  }

  const interactionMode = transactionModalOpen || connectionModalOpen;
  const value = interactionMode ? networkFromChainId : selectedNetwork;
  if (!value) {
    throw new Error('Could not find selected network');
  }

  // The above if statement ensures that either networkFromChainId or selectedNetwork is defined. So value is always defined.
  return <NetworkContext.Provider value={{ network: value, interactionMode }}>{children}</NetworkContext.Provider>
};
