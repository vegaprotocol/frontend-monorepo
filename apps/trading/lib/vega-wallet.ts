import {
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  createConfig,
  fairground,
  stagnet,
  type Store,
} from '@vegaprotocol/wallet';
import { useStore } from 'zustand';

export const injected = new InjectedConnector();
export const jsonRpc = new JsonRpcConnector({
  url: 'http://localhost:1789/api/v2/requests',
});
export const snap = new SnapConnector({
  node: 'https://api.n08.testnet.vega.rocks',
  id: 'npm:@vegaprotocol/snap',
  version: '0.3.1',
});

export const config = createConfig({
  chains: [fairground, stagnet],
  connectors: [injected, jsonRpc, snap],
});

// Wrap store and provide single selected key (app does not currently support multi key)
export function useVegaWallet<T>(selector: (store: Store) => T) {
  const store = useStore(config.store, selector);

  return store;
}
