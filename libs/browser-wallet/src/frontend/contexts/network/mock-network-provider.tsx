import { useMemo } from 'react';

import type { Network } from '@/types/backend';

import { testingNetwork } from '../../../config/well-known-networks';
import { NetworkContext } from './network-context';

interface NetworkContextShape {
  network?: Network;
  interactionMode?: boolean;
}

/**
 * Provides a network through useNetworkProvider. If the app is in interaction mode with the network specified in the currentConnectionDetails or currentTransactionDetails then that network is provided. Otherwise the selected network is provided.
 * @param param0
 * @returns
 */
export const MockNetworkProvider = ({
  children,
  interactionMode = false,
  network = testingNetwork,
}: NetworkContextShape & {
  children: JSX.Element;
}) => {
  const value = useMemo(
    () => ({ network, interactionMode }),
    [network, interactionMode]
  );
  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
