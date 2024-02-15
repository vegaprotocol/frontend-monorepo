import { createStore } from 'zustand/vanilla';
import { createElement, type PropsWithChildren } from 'react';
import {
  createCoreStoreSlice,
  createSingleKeySlice,
  type Wallet,
  type Store,
} from '@vegaprotocol/wallet';
import { WalletContext } from './context';

const store = createStore<Store>()((...args) => ({
  ...createCoreStoreSlice(...args),
  ...createSingleKeySlice(...args),
  chainId: 'test-chain-id',
}));

const defaultContext: Wallet = {
  store,
  connectors: [],
  connect: () => Promise.resolve({ success: true }),
  disconnect: () => Promise.resolve({ success: true }),
  refreshKeys: () => Promise.resolve(),
  sendTransaction: (_) => {
    return Promise.resolve({
      transactionHash: 'test-tx-hash',
      signature: 'test-signature',
      sentAt: '2024-01-01T00:00:00.000Z',
      receivedAt: '2024-01-01T00:00:00.000Z',
    });
  },
};

export function MockedWalletProvider({
  children,
  config,
  store: testStore,
}: PropsWithChildren<{
  config?: Partial<Wallet>;
  store?: Partial<Store>;
}>) {
  // TODO: dont do this, dodgy set states in render
  if (testStore) {
    store.setState(testStore);
  }
  const value = { ...defaultContext, ...config };

  return createElement(WalletContext.Provider, { value }, children);
}
