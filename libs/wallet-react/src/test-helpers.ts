import { type StoreApi } from 'zustand/vanilla';
import { createElement, type PropsWithChildren } from 'react';
import { createConfig, type Store, type Connector } from '@vegaprotocol/wallet';
import { WalletContext } from './context';

export const mockKeys = [
  {
    name: 'Key 1',
    publicKey: '1'.repeat(64),
  },
  {
    name: 'Key 2',
    publicKey: '2'.repeat(64),
  },
];

export class MockConnector implements Connector {
  readonly id = 'mock';
  readonly name = 'Mock';
  readonly description = 'Connector for test purposes';

  store: StoreApi<Store> | undefined;

  constructor() {}

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet() {
    return { success: true };
  }

  async disconnectWallet() {
    return { success: true };
  }

  async getChainId() {
    return {
      chainId: mockChain.id,
    };
  }

  async listKeys() {
    return mockKeys;
  }

  async isConnected() {
    return { connected: true };
  }

  // @ts-ignore deliberate fail
  async sendTransaction() {
    return {
      transactionHash: '0x' + 'a'.repeat(64),
      signature: '0x' + 'a'.repeat(64),
      sentAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };
  }

  on() {}

  off() {}
}

const mockConnector = new MockConnector();

export const mockChain = {
  id: 'mock-chain',
  testnet: true,
  name: 'My Mocked Chain',
};

// export const mockConfig = createConfig({
//   chains: [mockChain],
//   defaultChainId: mockChain.id,
//   connectors: [mockConnector],
// });

export function MockedWalletProvider({ children }: PropsWithChildren) {
  return createElement(WalletContext.Provider, { value: mockConfig }, children);
}
