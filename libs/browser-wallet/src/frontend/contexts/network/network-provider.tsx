import { useEffect } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useGlobalsStore } from '@/stores/globals';
import { useInteractionStore } from '@/stores/interaction-store';

import { NetworkContext } from './network-context';

export const locators = {
  networkProviderLoading: 'network-provider-loading',
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

  const { transactionModalOpen, connectionModalOpen } = useInteractionStore(
    (store) => ({
      transactionModalOpen: store.transactionModalOpen,
      connectionModalOpen: store.connectionModalOpen,
    })
  );

  useEffect(() => {
    loadGlobals(request);
  }, [loadGlobals, request]);
  if (loadingGlobals) {
    return (
      <div
        data-testid={locators.networkProviderLoading}
        className="h-full w-full bg-surface-0"
      />
    );
  }

  const interactionMode = transactionModalOpen || connectionModalOpen;

  // The above if statement ensures that either networkFromChainId or selectedNetwork is defined. So value is always defined.
  return (
    <NetworkContext.Provider
      value={{
        interactionMode,
        ethereumExplorerLink: 'https://sepolia.etherscan.io',
        arbitrumExplorerLink: 'https://sepolia.arbiscan.io',
        explorer: 'https://explorer.fairground.wtf',
        docs: 'https://docs.fairground.wtf',
        governance: 'https://governance.fairground.wtf',
        console: 'https://console.fairground.wtf',
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
