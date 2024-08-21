import { useEffect, useMemo } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useGlobalsStore } from '@/stores/globals';
import { useInteractionStore } from '@/stores/interaction-store';

import { NetworkContext, type NetworkContextShape } from './network-context';

export const locators = {
  networkProviderLoading: 'network-provider-loading',
};

/**
 * Provides a network through useNetworkProvider. If the app is in interaction mode with the network specified in the currentConnectionDetails or currentTransactionDetails then that network is provided. Otherwise the selected network is provided.
 * @param param0
 * @returns
 */
export const NetworkProvider = ({
  children,
  ethereumExplorerLink,
  arbitrumExplorerLink,
  explorer,
  docs,
  governance,
  console,
  arbitrumChainId,
  ethereumChainId,
  chainId,
}: { children: JSX.Element } & Omit<
  NetworkContextShape,
  'interactionMode'
>) => {
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
  const interactionMode = transactionModalOpen || connectionModalOpen;
  const value = useMemo(
    () => ({
      ethereumExplorerLink,
      arbitrumExplorerLink,
      explorer,
      docs,
      governance,
      console,
      arbitrumChainId,
      ethereumChainId,
      chainId,
      interactionMode,
    }),
    [
      arbitrumChainId,
      arbitrumExplorerLink,
      chainId,
      console,
      docs,
      ethereumChainId,
      ethereumExplorerLink,
      explorer,
      governance,
      interactionMode,
    ]
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

  // The above if statement ensures that either networkFromChainId or selectedNetwork is defined. So value is always defined.
  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
